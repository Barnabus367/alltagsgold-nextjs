const fs = require('fs-extra');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const glob = require('glob');

class ProjectAnalyzer {
  constructor(projectPath, options = {}) {
    this.projectPath = projectPath;
    this.verbose = options.verbose || false;
    this.analysis = {
      components: [],
      routes: [],
      assets: [],
      dependencies: {},
      config: null,
      entryPoints: []
    };
  }

  async analyze() {
    console.log('🔍 Analyzing Vite React project...');
    
    await this.analyzePackageJson();
    await this.analyzeViteConfig();
    await this.analyzeComponents();
    await this.analyzeRoutes();
    await this.analyzeAssets();
    await this.analyzeEntryPoints();

    return this.analysis;
  }

  async analyzePackageJson() {
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      this.analysis.dependencies = {
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {},
        scripts: packageJson.scripts || {}
      };
      
      if (this.verbose) {
        console.log('  📦 Package.json analyzed');
      }
    }
  }

  async analyzeViteConfig() {
    const configPaths = [
      'vite.config.js',
      'vite.config.ts',
      'vite.config.mjs'
    ];

    for (const configPath of configPaths) {
      const fullPath = path.join(this.projectPath, configPath);
      if (await fs.pathExists(fullPath)) {
        const configContent = await fs.readFile(fullPath, 'utf8');
        this.analysis.config = {
          path: configPath,
          content: configContent
        };
        
        if (this.verbose) {
          console.log(`  ⚙️  Vite config found: ${configPath}`);
        }
        break;
      }
    }
  }

  async analyzeComponents() {
    const componentPatterns = [
      'src/**/*.jsx',
      'src/**/*.tsx',
      'src/**/*.js',
      'src/**/*.ts'
    ];

    for (const pattern of componentPatterns) {
      const files = glob.sync(pattern, { cwd: this.projectPath });
      
      for (const file of files) {
        const fullPath = path.join(this.projectPath, file);
        const content = await fs.readFile(fullPath, 'utf8');
        
        try {
          const ast = parse(content, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
          });

          const componentInfo = {
            path: file,
            fullPath,
            isComponent: false,
            imports: [],
            exports: [],
            routerUsage: false
          };

          traverse(ast, {
            ImportDeclaration(path) {
              componentInfo.imports.push({
                source: path.node.source.value,
                specifiers: path.node.specifiers.map(spec => ({
                  type: spec.type,
                  local: spec.local?.name,
                  imported: spec.imported?.name
                }))
              });

              // Check for React Router usage
              if (path.node.source.value.includes('react-router')) {
                componentInfo.routerUsage = true;
              }
            },

            ExportDefaultDeclaration(path) {
              componentInfo.exports.push({
                type: 'default',
                name: path.node.declaration.name || 'default'
              });
            },

            ExportNamedDeclaration(path) {
              if (path.node.declaration) {
                if (path.node.declaration.type === 'FunctionDeclaration') {
                  componentInfo.exports.push({
                    type: 'named',
                    name: path.node.declaration.id.name
                  });
                }
              }
            },

            JSXElement() {
              componentInfo.isComponent = true;
            }
          });

          this.analysis.components.push(componentInfo);

        } catch (error) {
          if (this.verbose) {
            console.log(`    ⚠️  Could not parse ${file}: ${error.message}`);
          }
        }
      }
    }

    if (this.verbose) {
      console.log(`  🧩 Found ${this.analysis.components.length} component files`);
    }
  }

  async analyzeRoutes() {
    // Look for React Router patterns
    const routePatterns = [];

    for (const component of this.analysis.components) {
      if (component.routerUsage) {
        const content = await fs.readFile(component.fullPath, 'utf8');
        
        try {
          const ast = parse(content, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
          });

          traverse(ast, {
            JSXElement(path) {
              if (path.node.openingElement.name.name === 'Route') {
                const pathAttr = path.node.openingElement.attributes.find(
                  attr => attr.name?.name === 'path'
                );
                const componentAttr = path.node.openingElement.attributes.find(
                  attr => attr.name?.name === 'component' || attr.name?.name === 'element'
                );

                if (pathAttr) {
                  routePatterns.push({
                    path: pathAttr.value.value,
                    component: componentAttr?.value?.value || 'unknown',
                    file: component.path
                  });
                }
              }
            }
          });

        } catch (error) {
          if (this.verbose) {
            console.log(`    ⚠️  Could not analyze routes in ${component.path}`);
          }
        }
      }
    }

    this.analysis.routes = routePatterns;

    if (this.verbose) {
      console.log(`  🛣️  Found ${this.analysis.routes.length} routes`);
    }
  }

  async analyzeAssets() {
    const assetPatterns = [
      'public/**/*',
      'src/assets/**/*',
      'assets/**/*'
    ];

    const assets = [];

    for (const pattern of assetPatterns) {
      const files = glob.sync(pattern, { 
        cwd: this.projectPath,
        nodir: true 
      });
      
      for (const file of files) {
        const fullPath = path.join(this.projectPath, file);
        const stats = await fs.stat(fullPath);
        
        assets.push({
          path: file,
          fullPath,
          size: stats.size,
          extension: path.extname(file)
        });
      }
    }

    this.analysis.assets = assets;

    if (this.verbose) {
      console.log(`  📁 Found ${this.analysis.assets.length} asset files`);
    }
  }

  async analyzeEntryPoints() {
    const entryPoints = [];
    
    // Check for common entry points
    const commonEntries = [
      'src/main.jsx',
      'src/main.tsx',
      'src/index.jsx',
      'src/index.tsx',
      'src/App.jsx',
      'src/App.tsx'
    ];

    for (const entry of commonEntries) {
      const fullPath = path.join(this.projectPath, entry);
      if (await fs.pathExists(fullPath)) {
        entryPoints.push({
          path: entry,
          fullPath,
          type: 'entry'
        });
      }
    }

    // Check index.html
    const indexHtmlPath = path.join(this.projectPath, 'index.html');
    if (await fs.pathExists(indexHtmlPath)) {
      entryPoints.push({
        path: 'index.html',
        fullPath: indexHtmlPath,
        type: 'html'
      });
    }

    this.analysis.entryPoints = entryPoints;

    if (this.verbose) {
      console.log(`  🎯 Found ${this.analysis.entryPoints.length} entry points`);
    }
  }
}

module.exports = { ProjectAnalyzer };
