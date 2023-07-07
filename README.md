# notation-azure-kv-sign-actions
Github Actions `notation sign` with notation-azure-kv plugin.

# Usage
1. sign with `notation plugin install` and cert bundle
```sh
- name: sign releasd image using key pair from AKV
    uses: notation-playground/notation-azure-kv-sign-actions@main
    env:
        AKV_PLUGIN_REF: <remote_registry_reference_of_akv_plugin>
        AKV_NAME: <name_of_your_akv>
        AKV_KEYID: <key_id_from_akv>
    with:
        key_id: ${{ env.AKV_KEYID }}
        target_artifact_reference: <remote_registry_reference_of_target_artifact>
        plugin_oci_ref: ${{ env.AKV_PLUGIN_REF }}
        cert_bundle_filepath: <file_path_to_cert_bundle>
```
For exmaple,
```sh
- name: sign releasd image using key pair from AKV
    uses: notation-playground/notation-azure-kv-sign-actions@main
    env:
        AKV_PLUGIN_REF: testnotation.azurecr.io/akv-plugin-linux@sha256:ee0b6ccbb6f4232e908c7a6876c10e56f5a02dff4537c30a38690fef1430a61b
        AKV_NAME: testnotationAKV
        AKV_KEYID: https://testnotationakv.vault.azure.net/keys/notationLeafCert/c585b8ad8fc542b28e41e555d9b3a1fd
    with:
        key_id: ${{ env.AKV_KEYID }}
        target_artifact_reference: ${{ steps.prepare.outputs.ref }}
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
        target_artifact_reference: <remote_registry_reference_of_target_artifact>
        cert_bundle_filepath: <file_path_to_cert_bundle>
```
3. sign with `notation plugin install` and self-signed cert
```sh
- name: sign releasd image using key pair from AKV
    uses: notation-playground/notation-azure-kv-sign-actions@main
    env:
        AKV_PLUGIN_REF: <remote_registry_reference_of_akv_plugin>
        AKV_NAME: <name_of_your_akv>
        AKV_KEYID: <key_id_from_akv>
    with:
        key_id: ${{ env.AKV_KEYID }}
        target_artifact_reference: <remote_registry_reference_of_target_artifact>
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
        target_artifact_reference: <remote_registry_reference_of_target_artifact>
```