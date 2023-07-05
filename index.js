const os = require('os');
const core = require('@actions/core');
const execSync = require('child_process').execSync;
const tc = require('@actions/tool-cache');
const path = require('path');
const fs = require('fs');
const mv = require('mv');
const akv_plugin_version = "1.0.0-rc.2";
const akv_plugin_name = "azure-kv"

// Map arch to go releaser arch
// Reference: https://nodejs.org/api/os.html#os_os_arch
function mapArch(arch) {
  const mappings = {
    arm: 'armv7',
    x64: 'amd64'
  };
  return mappings[arch] || arch;
}

// Map os to go releaser os
// Reference: https://nodejs.org/api/os.html#os_os_platform
function mapOS(os) {
  const mappings = {
    win32: 'windows'
  };
  return mappings[os] || os;
}

// Get the URL to download asset
function getDownloadURL() {
  const platform = os.platform();
  const filename = `notation-azure-kv_${akv_plugin_version}_${mapOS(platform)}_${mapArch(os.arch())}`;
  const extension = platform === 'win32' ? 'zip' : 'tar.gz';
  return `https://github.com/Azure/notation-azure-kv/releases/download/v${akv_plugin_version}/${filename}.${extension}`;
}

async function sign() {
  try {
    await setupPlugin()
    let output = execSync(`notation plugin ls`, { encoding: 'utf-8' });
    console.log('notation plugin list output:\n', output);
    const akv_key_id = core.getInput('key_id');
    const target_artifact_ref = core.getInput('target_artifact_reference');
    if (process.env.NOTATION_EXPERIMENTAL) {
      let output = execSync(`notation sign --signature-format cose --allow-referrers-api --id ${akv_key_id} --plugin ${akv_plugin_name} ${target_artifact_ref}`, { encoding: 'utf-8' });
      console.log('notation sign output:\n', output);
    } else {
      let output = execSync(`notation sign --signature-format cose --id ${akv_key_id} --plugin ${akv_plugin_name} ${target_artifact_ref}`, { encoding: 'utf-8' });
      console.log('notation sign output:\n', output);
    }
  } catch (e) {
    core.setFailed(e);
  }
}

async function setupPlugin() {
  try {
    const plugin_oci_ref = core.getInput('plugin_oci_ref');
    if (plugin_oci_ref) {
      let output = execSync(`notation plugin install --name ${akv_plugin_name} ${plugin_oci_ref}`, { encoding: 'utf-8' });
      console.log('notation plugin install output:\n', output);
    } else {
      const url = getDownloadURL()
      console.log(`notation-azure-kv url is ${url}`)
      const pluginPath = os.homedir() + `/.config/notation/plugins/${akv_plugin_name}`
      fs.mkdirSync(pluginPath, { recursive: true, })

      const pathToTarball = await tc.downloadTool(url);
      const extract = url.endsWith('.zip') ? tc.extractZip : tc.extractTar;
      const pathToPluginDownload = await extract(pathToTarball);

      const currentPath = path.join(pathToPluginDownload, "/", `notation-${akv_plugin_name}`)
      const destinationPath = path.join(pluginPath, "/", `notation-${akv_plugin_name}`)

      mv(currentPath, destinationPath, function (err) {
        if (err) {
          throw err
        } else {
          console.log(`Successfully moved the plugin file to ${destinationPath}`);
          fs.chmod(destinationPath, 0o755, (err) => {
            if (err) throw err;
            console.log(`The permissions for file "${destinationPath}" have been changed`);
          });
        }
      });
    }
  } catch (e) {
    core.setFailed(e);
  }
}

module.exports = sign

if (require.main === module) {
  sign();
}