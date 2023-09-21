# Migrate or Downgrade

## Background
Trubudget until version 2.2.0 used the MinIO Image Version `2021-06-17T00-10-46Z` for the Storage Service. This version had some [security issues,](https://www.cvedetails.com/vulnerability-list/vendor_id-18671/Minio.html) thus we patched the version to `2023-09-04T19-57-37Z`. From version `2022-10-24T18-35-07Z` MinIO has introduced a new file system and therefore a breaking change. TruBudget from version 2.3.0 onwards will use MinIO version `2023-09-04T19-57-37Z`. If you have a running TruBudget instance, with a Storage Service instance, you will have to either migrate your data to the new server or downgrade MinIO to `2021-06-17T00-10-46Z`.

:::note
The Storage Service is not directly exposed to the web, therefore security vulnerabilities from version `2021-06-17T00-10-46Z` on should not affect you as long as you configured your deployment in a way that MinIO is not exposed.
:::


## Continuing using version `2021-06-17T00-10-46Z`

### When using Docker
If you decide to continue using version `2021-06-17T00-10-46Z`, you have to downgrade the Docker image in the following files:

 - `docker-compose/storage-service/docker-compose.yml`
 - `scripts/operation/docker-compose.provision.yml`
 - `scripts/operation/docker-compose.yml`

 and for development in `scripts/development/docker-compose.yml` respectively.
 
 As reference, you can have a look [here](https://github.com/openkfw/TruBudget/commit/792635507ad7cfa3cdfb77de9fd0529de07f75f1).


### When you have MinIO installed locally
Here you can just install version `2021-06-17T00-10-46Z` as local package.

## Migration 

### When you have MinIO installed locally
For this case, you can follow the steps [here](https://min.io/docs/minio/linux/operations/install-deploy-manage/migrate-fs-gateway.html).

### When using Docker
For this, you can follow the instructions [here](https://github.com/minio/docs/issues/660#issuecomment-1360440761).