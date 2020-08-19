import { PackageMetadataLoader } from '../../lib/parse/PackageMetadataLoader';
import { ResolutionContextMocked } from '../ResolutionContextMocked';

describe('PackageMetadataLoader', () => {
  const resolutionContext = new ResolutionContextMocked({});
  let loader: PackageMetadataLoader;

  beforeEach(() => {
    loader = new PackageMetadataLoader({ resolutionContext });
  });

  describe('load', () => {
    it('should error on a non-existing package.json', async() => {
      resolutionContext.contentsOverrides = {};
      await expect(loader.load('/')).rejects
        .toThrow(new Error('Could not find mocked path for /package.json'));
    });

    it('should return with all required entries', async() => {
      resolutionContext.contentsOverrides = {
        '/package.json': `{
  "name": "@solid/community-server",
  "lsd:module": "https://linkedsoftwaredependencies.org/bundles/npm/@solid/community-server",
  "lsd:components": "components/components.jsonld",
  "lsd:contexts": {
    "https://linkedsoftwaredependencies.org/bundles/npm/@solid/community-server/^1.0.0/components/context.jsonld": "components/context.jsonld"
  }
}`,
        '/components/context.jsonld': `{
  "a": "b"
}`,
      };
      expect(await loader.load('/')).toEqual({
        componentsPath: '/components/components.jsonld',
        contexts: {
          'https://linkedsoftwaredependencies.org/bundles/npm/@solid/community-server/^1.0.0/components/context.jsonld':
            {
              a: 'b',
            },
        },
        moduleIri: 'https://linkedsoftwaredependencies.org/bundles/npm/@solid/community-server',
        name: '@solid/community-server',
      });
    });

    it('should error on invalid JSON', async() => {
      resolutionContext.contentsOverrides = {
        '/package.json': `{`,
      };
      await expect(loader.load('/')).rejects
        .toThrow(new Error('Invalid package: Syntax error in /package.json: Unexpected end of JSON input'));
    });

    it('should error when lsd:module is missing', async() => {
      resolutionContext.contentsOverrides = {
        '/package.json': `{
  "name": "@solid/community-server",
  "lsd:components": "components/components.jsonld",
  "lsd:contexts": {
    "https://linkedsoftwaredependencies.org/bundles/npm/@solid/community-server/^1.0.0/components/context.jsonld": "components/context.jsonld"
  }
}`,
      };
      await expect(loader.load('/')).rejects
        .toThrow(new Error('Invalid package: Missing \'lsd:module\' IRI in /package.json'));
    });

    it('should error when lsd:components is missing', async() => {
      resolutionContext.contentsOverrides = {
        '/package.json': `{
  "name": "@solid/community-server",
  "lsd:module": "https://linkedsoftwaredependencies.org/bundles/npm/@solid/community-server",
  "lsd:contexts": {
    "https://linkedsoftwaredependencies.org/bundles/npm/@solid/community-server/^1.0.0/components/context.jsonld": "components/context.jsonld"
  }
}`,
      };
      await expect(loader.load('/')).rejects
        .toThrow(new Error('Invalid package: Missing \'lsd:components\' in /package.json'));
    });

    it('should error when lsd:contexts is missing', async() => {
      resolutionContext.contentsOverrides = {
        '/package.json': `{
  "name": "@solid/community-server",
  "lsd:module": "https://linkedsoftwaredependencies.org/bundles/npm/@solid/community-server",
  "lsd:components": "components/components.jsonld"
}`,
      };
      await expect(loader.load('/')).rejects
        .toThrow(new Error('Invalid package: Missing \'lsd:contexts\' in /package.json'));
    });

    it('should error when a lsd:contexts reference does not exist', async() => {
      resolutionContext.contentsOverrides = {
        '/package.json': `{
  "name": "@solid/community-server",
  "lsd:module": "https://linkedsoftwaredependencies.org/bundles/npm/@solid/community-server",
  "lsd:components": "components/components.jsonld",
  "lsd:contexts": {
    "https://linkedsoftwaredependencies.org/bundles/npm/@solid/community-server/^1.0.0/components/context.jsonld": "components/context.jsonld"
  }
}`,
      };
      await expect(loader.load('/')).rejects
        .toThrow(new Error('Could not find mocked path for /components/context.jsonld'));
    });

    it('should error when a lsd:contexts reference contains invalid JSON', async() => {
      resolutionContext.contentsOverrides = {
        '/package.json': `{
  "name": "@solid/community-server",
  "lsd:module": "https://linkedsoftwaredependencies.org/bundles/npm/@solid/community-server",
  "lsd:components": "components/components.jsonld",
  "lsd:contexts": {
    "https://linkedsoftwaredependencies.org/bundles/npm/@solid/community-server/^1.0.0/components/context.jsonld": "components/context.jsonld"
  }
}`,
        '/components/context.jsonld': `{`,
      };
      await expect(loader.load('/')).rejects
        .toThrow(new Error(`Invalid JSON-LD context: Syntax error in /components/context.jsonld: Unexpected end of JSON input`));
    });
  });
});
