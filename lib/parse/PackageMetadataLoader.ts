import * as Path from 'path';
import { ResolutionContext } from '../resolution/ResolutionContext';

/**
 * Load metadata from packages.
 */
export class PackageMetadataLoader {
  private readonly resolutionContext: ResolutionContext;

  public constructor(args: PackageMetadataLoaderArgs) {
    this.resolutionContext = args.resolutionContext;
  }

  /**
   * Load the metadata from the given package.
   * @param packageRootDirectory The path to a package that should contain a package.json.
   */
  public async load(packageRootDirectory: string): Promise<PackageMetadata> {
    // Read package.json
    const packageJsonPath = Path.join(packageRootDirectory, 'package.json');
    const packageJsonRaw = await this.resolutionContext.getFileContent(packageJsonPath);
    let packageJson: any;
    try {
      packageJson = JSON.parse(packageJsonRaw);
    } catch (error) {
      throw new Error(`Invalid package: Syntax error in ${packageJsonPath}: ${error.message}`);
    }

    // Extract required fields from package.json
    const name = packageJson.name;
    const version = packageJson.version;
    if (!('lsd:module' in packageJson)) {
      throw new Error(`Invalid package: Missing 'lsd:module' IRI in ${packageJsonPath}`);
    }
    const moduleIri = packageJson['lsd:module'];
    if (!('lsd:components' in packageJson)) {
      throw new Error(`Invalid package: Missing 'lsd:components' in ${packageJsonPath}`);
    }
    const componentsPath = Path.join(packageRootDirectory, packageJson['lsd:components']);
    if (!('lsd:contexts' in packageJson)) {
      throw new Error(`Invalid package: Missing 'lsd:contexts' in ${packageJsonPath}`);
    }
    const contexts = packageJson['lsd:contexts'];
    if (!('lsd:importPaths' in packageJson)) {
      throw new Error(`Invalid package: Missing 'lsd:importPaths' in ${packageJsonPath}`);
    }
    const importPaths = packageJson['lsd:importPaths'];

    // Construct metadata hash
    return {
      name,
      version,
      moduleIri,
      componentsPath,
      contexts,
      importPaths,
    };
  }
}

export interface PackageMetadataLoaderArgs {
  resolutionContext: ResolutionContext;
}

export interface PackageMetadata {
  name: string;
  version: string;
  moduleIri: string;
  componentsPath: string;
  contexts: {[iri: string]: string};
  importPaths: {[iri: string]: string};
}
