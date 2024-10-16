import { Arch, getArchSuffix } from "builder-util"
import { computeDownloadUrl, getPublishConfigs, getPublishConfigsForUpdateInfo } from "../../publish/PublishManager"
import { WinPackager } from "../../winPackager"
import { NsisWebOptions } from "./nsisOptions"
import { NsisTarget } from "./NsisTarget"
import { AppPackageHelper } from "./nsisUtil"

/** @private */
export class WebInstallerTarget extends NsisTarget {
  constructor(packager: WinPackager, outDir: string, targetName: string, packageHelper: AppPackageHelper) {
    super(packager, outDir, targetName, packageHelper)
  }

  get isWebInstaller(): boolean {
    return true
  }

  protected async configureDefines(oneClick: boolean, defines: any): Promise<any> {
    //noinspection ES6MissingAwait
    await (NsisTarget.prototype as WebInstallerTarget).configureDefines.call(this, oneClick, defines)

    const packager = this.packager
    const options = this.options as NsisWebOptions

    let appPackageUrl = options.appPackageUrl
    if (appPackageUrl == null) {
      const publishConfigs = await getPublishConfigsForUpdateInfo(packager, await getPublishConfigs(packager, packager.info.config, null, false), null)
      if (publishConfigs == null || publishConfigs.length === 0) {
        throw new Error("Cannot compute app package download URL")
      }

      appPackageUrl = computeDownloadUrl(publishConfigs[0], null, packager)
    }

    defines.APP_PACKAGE_URL_IS_INCOMPLETE = null
    defines.APP_PACKAGE_URL = appPackageUrl
  }

  protected installerFilenamePattern(primaryArch?: Arch | null, defaultArch?: string): string {
    if (this.buildIndividualInstallers()) {
      return "${productName} Web Setup ${version}" + (primaryArch != null ? getArchSuffix(primaryArch, defaultArch) : "") + ".${ext}"
    }
    return "${productName} Web Setup ${version}.${ext}"
  }

  protected generateGitHubInstallerName(): string {
    const appInfo = this.packager.appInfo
    const classifier = appInfo.name.toLowerCase() === appInfo.name ? "web-setup" : "WebSetup"
    return `${appInfo.name}-${classifier}-${appInfo.version}.exe`
  }
}
