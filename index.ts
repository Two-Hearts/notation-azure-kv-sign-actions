import * as os from 'os';
import * as core from '@actions/core';
import { execSync } from 'child_process';
import * as tc from '@actions/tool-cache';
import * as path from 'path';
import * as fs from 'fs';
import * as mv from 'mv';

const akv_plugin_version = "1.0.0-rc.2";
const akv_plugin_name = "azure-kv";
const akv_subscription_id = process.env.AKV_SUBSCRIPTION_ID;
const akv_name = process.env.AKV_NAME;
const azure_service_principle_client_id = process.env.AZURE_SERVICE_PRINCIPLE_CLIENT_ID;

// Map arch to go releaser arch
// Reference: https://nodejs.org/api/os.html#os_os_arch
function mapArch(arch: string): string {
    const mappings: {[key: string]: string} = {
        arm: 'armv7',
        x64: 'amd64'
    };
    return mappings[arch] || arch;
}

// Map os to go releaser os
// Reference: https://nodejs.org/api/os.html#os_os_platform
function mapOS(os: string): string {
    const mappings: {[key: string]: string} = {
        win32: 'windows'
    };
    return mappings[os] || os;
}

// Get the URL to download asset
function getDownloadURL(): string {
    const platform = os.platform();
    const filename = `notation-azure-kv_${akv_plugin_version}_${mapOS(platform)}_${mapArch(os.arch())}`;
    const extension = platform === 'win32' ? 'zip' : 'tar.gz';
    return `https://github.com/Azure/notation-azure-kv/releases/download/v${akv_plugin_version}/${filename}.${extension}`;
}

// sign the target artifact with Notation
async function sign() {
    try {
        await setupAKVPlugin();
        let output = execSync(`notation plugin ls`, { encoding: 'utf-8' });
        console.log('notation plugin list output:\n', output);
        const akv_key_id = core.getInput('key_id');
        const cert_bundle_filepath = core.getInput('cert_bundle_filepath');
        const target_artifact_ref = core.getInput('target_artifact_reference');
        let signOutput;
        if (process.env.NOTATION_EXPERIMENTAL) {
            if (cert_bundle_filepath) {
                signOutput = execSync(`notation sign --signature-format cose --allow-referrers-api --id ${akv_key_id} --plugin ${akv_plugin_name} --plugin-config=ca_certs=${cert_bundle_filepath} ${target_artifact_ref}`, { encoding: 'utf-8' });
            } else {
                signOutput = execSync(`notation sign --signature-format cose --allow-referrers-api --id ${akv_key_id} --plugin ${akv_plugin_name} ${target_artifact_ref}`, { encoding: 'utf-8' });
            }
            console.log('notation sign output:\n', signOutput);
        } else {
            if (cert_bundle_filepath) {
                signOutput = execSync(`notation sign --signature-format cose --id ${akv_key_id} --plugin ${akv_plugin_name} --plugin-config=ca_certs=${cert_bundle_filepath} ${target_artifact_ref}`, { encoding: 'utf-8' });
            } else {
                signOutput = execSync(`notation sign --signature-format cose --id ${akv_key_id} --plugin ${akv_plugin_name} ${target_artifact_ref}`, { encoding: 'utf-8' });
            }
            console.log('notation sign output:\n', signOutput);
        }
    } catch (e: unknown) {
        if (e instanceof Error) {
            core.setFailed(e);
        } else {
            core.setFailed('Unknown error');
        }
    }
}

// setup notation-azure-kv plugin and related permissions to Sign.
async function setupAKVPlugin() {
    try {
        const plugin_oci_ref = core.getInput('plugin_oci_ref');
        if (plugin_oci_ref) {
            execSync(`notation plugin install --name ${akv_plugin_name} ${plugin_oci_ref}`, { encoding: 'utf-8' });
            console.log('Successfully installed notation-azure-akv plugin with `notation plugin install`');
        } else {
            const url = getDownloadURL();
            console.log(`notation-azure-kv url is ${url}`);
            const pluginPath = os.homedir() + `/.config/notation/plugins/${akv_plugin_name}`;
            fs.mkdirSync(pluginPath, { recursive: true, });

            const pathToTarball = await tc.downloadTool(url);
            const extract = url.endsWith('.zip') ? tc.extractZip : tc.extractTar;
            const pathToPluginDownload = await extract(pathToTarball);

            const currentPath = path.join(pathToPluginDownload, "/", `notation-${akv_plugin_name}`);
            const destinationPath = path.join(pluginPath, "/", `notation-${akv_plugin_name}`);

            mv.default(currentPath, destinationPath, function (err: Error) {
                if (err) throw err;
                console.log(`Successfully moved the plugin file to ${destinationPath}`);
                fs.chmod(destinationPath, 0o755, (err) => {
                    if (err) throw err;
                    console.log(`Successfully changed permission for file "${destinationPath}"`);
                });
            });
        }
        execSync(`az account set -s ${akv_subscription_id}`, { encoding: 'utf-8' });
        let output = execSync(`az keyvault set-policy -n ${akv_name} --secret-permissions get list --key-permissions sign --certificate-permissions get --spn ${azure_service_principle_client_id}`, { encoding: 'utf-8' });
        console.log('az keyvault set-policy output:\n', output);
    } catch (e: unknown) {
        if (e instanceof Error) {
            core.setFailed(e);
        } else {
            core.setFailed('Unknown error');
        }
    }
}

export = sign;

if (require.main === module) {
  sign();
}