const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { ProjectAnalyzer } = require('./analyzer');
const { CodeTransformer } = require('./transformer');

class ViteToNextMigrator {
  constructor(sourcePath, targetPath, options = {}) {
    this.sourcePath = sourcePath;
    this.targetPath = targetPath;
    this.options = options;
    this.verbose = options.verbose || false;
    
    this.analyzer = new ProjectAnalyzer(sourcePath, options);
    this.transformer = new CodeTransformer(options);
    
    this.report = {
      filesMigrated: 0,
      componentsTransformed: 0,
      routesMigrated: 0,
      dependenciesUpdated: 0,
      warnings: [],
      errors: []
    };
  }

  async migrate() {
    try {
      // Step 1: Create backup if requested
      if (this.options.backup) {
        await this.createBackup();
      }

      // Step 2: Analyze the source project
      console.log(chalk.blue('🔍 Analyzing source project...'));
      const analysis = await this.analyzer.analyze();

      // Step 3: Create target directory structure
      console.log(chalk.blue('📁 Creating Next.js project structure...'));
      await this.createNextjsStructure();

      // Step 4: Migrate components
      console.log(chalk.blue('🧩 Migrating components...'));
      await this.migrateComponents(analysis);

      // Step 5: Migrate routes
      console.log(chalk.blue('🛣️  Converting routes...'));
      await this.migrateRoutes(analysis);

      // Step 6: Migrate assets
      console.log(chalk.blue('📁 Migrating assets...'));
      await this.migrateAssets(analysis);

      // Step 7: Generate configuration files
      console.log(chalk.blue('⚙️  Generating configuration...'));
      await this.generateConfiguration(analysis);

      // Step 8: Update package.json
      console.log(chalk.blue('📦 Updating package.json...'));
      await this.updatePackageJson(analysis);

      // Step 9: Create additional Next.js files
      await this.createNextjsFiles();

      return this.report;

    } catch (error) {
      this.report.errors.push(error.message);
      throw error;
    }
  }

  async createBackup() {
    const backupPath = `${this.sourcePath}-backup-${Date.now()}`;
    console.log(chalk.yellow(`💾 Creating backup at: ${backupPath}`));
    await fs.copy(this.sourcePath, backupPath);
  }

  async createNextjsStructure() {
    // Create basic Next.js directory structure
    const directories = [
      'pages',
      'pages/api',
      'public',
      'styles',
      'components',
      'lib',
      'utils'
    ];

    for (const dir of directories) {
      await fs.ensureDir(path.join(this.targetPath, dir));
    }

    this.report.filesMigrated += directories.length;
  }

  async migrateComponents(analysis) {
    for (const component of analysis.components) {
      if (component.isComponent) {
        const sourceCode = await fs.readFile(component.fullPath, 'utf8');
        const result = this.transformer.transformComponent(sourceCode, component.path);

        if (result.error) {
          this.report.warnings.push(`Could not transform ${component.path}: ${result.error}`);
          continue;
        }

        // Determine target path
        let targetPath;
        if (component.path.startsWith('src/')) {
          targetPath = component.path.replace('src/', 'components/');
        } else {
          targetPath = `components/${path.basename(component.path)}`;
        }

        const fullTargetPath = path.join(this.targetPath, targetPath);
        await fs.ensureDir(path.dirname(fullTargetPath));
        await fs.writeFile(fullTargetPath, result.code);

        if (result.transformed) {
          this.report.componentsTransformed++;
        }

        if (result.transformations.length > 0) {
          this.report.warnings.push(`${component.path}: ${result.transformations.join(', ')}`);
        }

        this.report.filesMigrated++;

        if (this.verbose) {
          console.log(`    ✅ Migrated: ${component.path} → ${targetPath}`);
        }
      }
    }
  }

  async migrateRoutes(analysis) {
    const routeMap = new Map();

    for (const route of analysis.routes) {
      const nextjsPagePath = this.transformer.transformRouteToNextPage(route);
      
      // Find the component file for this route
      const componentFile = analysis.components.find(comp => 
        comp.path.includes(route.component) || 
        comp.exports.some(exp => exp.name === route.component)
      );

      if (componentFile && componentFile.isComponent) {
        const sourceCode = await fs.readFile(componentFile.fullPath, 'utf8');
        const result = this.transformer.transformComponent(sourceCode, componentFile.path);
        
        const componentName = route.component || 'Component';
        const pageCode = this.transformer.generateNextPageWrapper(result.code, componentName);

        const fullPagePath = path.join(this.targetPath, nextjsPagePath);
        await fs.ensureDir(path.dirname(fullPagePath));
        await fs.writeFile(fullPagePath, pageCode);

        routeMap.set(route.path, nextjsPagePath);
        this.report.routesMigrated++;

        if (this.verbose) {
          console.log(`    ✅ Route: ${route.path} → ${nextjsPagePath}`);
        }
      } else {
        this.report.warnings.push(`Could not find component for route: ${route.path}`);
      }
    }

    // Create a route mapping file for reference
    if (routeMap.size > 0) {
      const routeMappingPath = path.join(this.targetPath, 'ROUTE_MAPPING.md');
      let mappingContent = '# Route Migration Mapping\n\n';
      mappingContent += '| Vite React Router | Next.js Pages |\n';
      mappingContent += '|------------------|---------------|\n';
      
      for (const [oldRoute, newRoute] of routeMap) {
        mappingContent += `| ${oldRoute} | ${newRoute} |\n`;
      }

      await fs.writeFile(routeMappingPath, mappingContent);
    }
  }

  async migrateAssets(analysis) {
    for (const asset of analysis.assets) {
      let targetPath;
      
      if (asset.path.startsWith('public/')) {
        // Assets in public directory stay in public
        targetPath = asset.path;
      } else if (asset.path.startsWith('src/assets/')) {
        // Move src/assets to public
        targetPath = asset.path.replace('src/assets/', 'public/');
      } else if (asset.path.startsWith('assets/')) {
        // Move assets to public
        targetPath = asset.path.replace('assets/', 'public/');
      } else {
        // Default to public directory
        targetPath = `public/${path.basename(asset.path)}`;
      }

      const fullTargetPath = path.join(this.targetPath, targetPath);
      await fs.ensureDir(path.dirname(fullTargetPath));
      await fs.copy(asset.fullPath, fullTargetPath);

      this.report.filesMigrated++;

      if (this.verbose) {
        console.log(`    ✅ Asset: ${asset.path} → ${targetPath}`);
      }
    }
  }

  async generateConfiguration(analysis) {
    // Generate next.config.js
    const nextConfig = this.transformer.generateNextConfig(analysis.config);
    await fs.writeFile(path.join(this.targetPath, 'next.config.js'), nextConfig);

    // Generate .eslintrc.json
    const eslintConfig = {
      extends: ['next/core-web-vitals']
    };
    await fs.writeFile(
      path.join(this.targetPath, '.eslintrc.json'), 
      JSON.stringify(eslintConfig, null, 2)
    );

    this.report.filesMigrated += 2;
  }

  async updatePackageJson(analysis) {
    const transformedPackageJson = this.transformer.transformPackageJson(analysis.dependencies);
    
    // Update name to reflect it's a Next.js version
    if (transformedPackageJson.name) {
      transformedPackageJson.name = transformedPackageJson.name + '-nextjs';
    }

    await fs.writeFile(
      path.join(this.targetPath, 'package.json'),
      JSON.stringify(transformedPackageJson, null, 2)
    );

    this.report.dependenciesUpdated = Object.keys(transformedPackageJson.dependencies || {}).length;
    this.report.filesMigrated++;
  }

  async createNextjsFiles() {
    // Create _app.js
    const appJs = `import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
`;
    await fs.writeFile(path.join(this.targetPath, 'pages/_app.js'), appJs);

    // Create _document.js
    const documentJs = `import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
`;
    await fs.writeFile(path.join(this.targetPath, 'pages/_document.js'), documentJs);

    // Create global styles
    const globalCss = `html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}
`;
    await fs.writeFile(path.join(this.targetPath, 'styles/globals.css'), globalCss);

    // Create migration notes
    const migrationNotes = `# Migration Notes

This project has been migrated from Vite React to Next.js.

## What was migrated:
- Components moved to /components directory
- Routes converted to Next.js pages
- Assets moved to /public directory
- Package.json updated with Next.js dependencies

## Manual steps required:
1. Review all TODO comments in the code
2. Update any React Router specific code to use Next.js router
3. Test all functionality
4. Review and update any custom webpack configurations
5. Update any environment variables

## Next.js specific features to consider:
- Server-side rendering (SSR)
- Static site generation (SSG)
- API routes
- Image optimization
- Built-in CSS support

## Commands:
- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
`;

    await fs.writeFile(path.join(this.targetPath, 'MIGRATION_NOTES.md'), migrationNotes);

    this.report.filesMigrated += 4;
  }
}

module.exports = { ViteToNextMigrator };
