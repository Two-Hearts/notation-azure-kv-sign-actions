# notation-azure-kv-sign-actions
Github Actions `notation sign` with notation-azure-kv plugin.

# Usage
1. sign with `notation plugin install` and cert bundle
```sh
- name: sign releasd image using key pair from AKV
  uses: notation-playground/notation-azure-kv-sign-actions@main
  env:
    AKV_PLUGIN_REF: <akv_plugin_reference_in_remote_registry>
    AKV_NAME: <name_of_your_akv>
    AKV_KEYID: <key_id_from_akv>
  with:
    key_id: ${{ env.AKV_KEYID }}
    target_artifact_reference: <target_artifact_reference_in_remote_registry>
    plugin_oci_ref: ${{ env.AKV_PLUGIN_REF }}
    cert_bundle_filepath: <file_path_to_cert_bundle>
```
For exmaple,
```sh
- name: sign releasd image using key pair from AKV
  uses: notation-playground/notation-azure-kv-sign-actions@main
  env:
    AKV_PLUGIN_REF: pluginRegistry.azurecr.io/akv-plugin-linux@sha256:ee0b6ccbb6f4232e908c7a6876c10e56f5a02dff4537c30a38690fef1430a61b
    AKV_NAME: notationAKV
    AKV_KEYID: https://notationakv.vault.azure.net/keys/notationLeafCert/c585b8ad8fc542b28e41e555d9b3a1fd
  with:
    key_id: ${{ env.AKV_KEYID }}
    target_artifact_reference: myRegistry.azurecr.io/myRepo@sha256:b27b8e75f6c08eee17e0610f99d9e874fc5a084e3f37ecd4c93b7b0324309e41
    plugin_oci_ref: ${{ env.AKV_PLUGIN_REF }}
    cert_bundle_filepath: .github/cert-bundle/cert-bundle.crt
```
2. sign with plugin url and cert bundle
```sh
- name: sign releasd image using key pair from AKV
  uses: notation-playground/notation-azure-kv-sign-actions@main
  env:
    AKV_NAME: <name_of_your_akv>
    AKV_KEYID: <key_id_from_akv>
  with:
    key_id: ${{ env.AKV_KEYID }}
    target_artifact_reference: <target_artifact_reference_in_remote_registry>
    cert_bundle_filepath: <file_path_to_cert_bundle>
```
3. sign with `notation plugin install` and self-signed cert
```sh
- name: sign releasd image using key pair from AKV
  uses: notation-playground/notation-azure-kv-sign-actions@main
  env:
    AKV_PLUGIN_REF: <akv_plugin_reference_in_remote_registry>
    AKV_NAME: <name_of_your_akv>
    AKV_KEYID: <key_id_from_akv>
  with:
    key_id: ${{ env.AKV_KEYID }}
    target_artifact_reference: <target_artifact_reference_in_remote_registry>
    plugin_oci_ref: ${{ env.AKV_PLUGIN_REF }}
```
4. sign with plugin url and self-signed cert
```sh
- name: sign releasd image using key pair from AKV
  uses: notation-playground/notation-azure-kv-sign-actions@main
  env:
    AKV_NAME: <name_of_your_akv>
    AKV_KEYID: <key_id_from_akv>
  with:
    key_id: ${{ env.AKV_KEYID }}
    target_artifact_reference: <target_artifact_reference_in_remote_registry>
```