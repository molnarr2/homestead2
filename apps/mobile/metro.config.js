const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

// Yarn workspaces hoist node_modules to the repo root, so Metro needs to know
// about the workspace root in addition to this app's directory.
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
// react-native-reanimated@4 needs semver@7 (for `semver/functions/satisfies`),
// but the workspace root ships semver@6 as a transitive dep. Because we run
// with `disableHierarchicalLookup: true`, Metro can't walk up into reanimated's
// nested node_modules. Intercept `semver` requests and redirect them to the
// copy that reanimated ships.
const reanimatedSemverPath = path.resolve(
  workspaceRoot,
  'node_modules/react-native-reanimated/node_modules/semver'
);

const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    disableHierarchicalLookup: true,
    resolveRequest: (context, moduleName, platform) => {
      // Only redirect the v7-only subpaths (functions/ranges/classes/internal)
      // so bare `require('semver')` calls elsewhere still use the root copy.
      if (/^semver\/(functions|ranges|classes|internal)\//.test(moduleName)) {
        const subpath = moduleName.slice('semver'.length);
        return context.resolveRequest(
          context,
          reanimatedSemverPath + subpath,
          platform
        );
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = withUniwindConfig(
  mergeConfig(getDefaultConfig(projectRoot), config),
  {
    cssEntryFile: './global.css',
  }
);
