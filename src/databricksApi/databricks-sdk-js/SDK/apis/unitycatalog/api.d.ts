import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
export declare class AccountMetastoreAssignmentsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class AccountMetastoreAssignmentsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * These APIs manage metastore assignments to a workspace.
 */
export declare class AccountMetastoreAssignmentsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Assigns a workspace to a metastore.
     *
     * Creates an assignment to a metastore for a workspace
     */
    create(request: model.CreateMetastoreAssignment, context?: Context): Promise<model.MetastoreAssignment>;
    private _delete;
    /**
     * Delete a metastore assignment.
     *
     * Deletes a metastore assignment to a workspace, leaving the workspace with
     * no metastore.
     */
    delete(request: model.DeleteAccountMetastoreAssignmentRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Gets the metastore assignment for a workspace.
     *
     * Gets the metastore assignment, if any, for the workspace specified by ID.
     * If the workspace is assigned a metastore, the mappig will be returned. If
     * no metastore is assigned to the workspace, the assignment will not be
     * found and a 404 returned.
     */
    get(request: model.GetAccountMetastoreAssignmentRequest, context?: Context): Promise<model.MetastoreAssignment>;
    private _list;
    /**
     * Get all workspaces assigned to a metastore.
     *
     * Gets a list of all Databricks workspace IDs that have been assigned to
     * given metastore.
     */
    list(request: model.ListAccountMetastoreAssignmentsRequest, context?: Context): Promise<Array<model.MetastoreAssignment>>;
    private _update;
    /**
     * Updates a metastore assignment to a workspaces.
     *
     * Updates an assignment to a metastore for a workspace. Currently, only the
     * default catalog may be updated
     */
    update(request: model.UpdateMetastoreAssignment, context?: Context): Promise<model.MetastoreAssignment>;
}
export declare class AccountMetastoresRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class AccountMetastoresError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * These APIs manage Unity Catalog metastores for an account. A metastore
 * contains catalogs that can be associated with workspaces
 */
export declare class AccountMetastoresService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create metastore.
     *
     * Creates a Unity Catalog metastore.
     */
    create(request: model.CreateMetastore, context?: Context): Promise<model.MetastoreInfo>;
    private _delete;
    /**
     * Delete a metastore.
     *
     * Deletes a Databricks Unity Catalog metastore for an account, both
     * specified by ID.
     */
    delete(request: model.DeleteAccountMetastoreRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get a metastore.
     *
     * Gets a Databricks Unity Catalog metastore from an account, both specified
     * by ID.
     */
    get(request: model.GetAccountMetastoreRequest, context?: Context): Promise<model.MetastoreInfo>;
    private _list;
    /**
     * Get all metastores associated with an account.
     *
     * Gets all Unity Catalog metastores associated with an account specified by
     * ID.
     */
    list(context?: Context): Promise<model.ListMetastoresResponse>;
    private _update;
    /**
     * Update a metastore.
     *
     * Updates an existing Unity Catalog metastore.
     */
    update(request: model.UpdateMetastore, context?: Context): Promise<model.MetastoreInfo>;
}
export declare class AccountStorageCredentialsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class AccountStorageCredentialsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * These APIs manage storage credentials for a particular metastore.
 */
export declare class AccountStorageCredentialsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a storage credential.
     *
     * Creates a new storage credential. The request object is specific to the
     * cloud:
     *
     * * **AwsIamRole** for AWS credentials * **AzureServicePrincipal** for Azure
     * credentials * **GcpServiceAcountKey** for GCP credentials.
     *
     * The caller must be a metastore admin and have the
     * **CREATE_STORAGE_CREDENTIAL** privilege on the metastore.
     */
    create(request: model.CreateStorageCredential, context?: Context): Promise<model.StorageCredentialInfo>;
    private _get;
    /**
     * Gets the named storage credential.
     *
     * Gets a storage credential from the metastore. The caller must be a
     * metastore admin, the owner of the storage credential, or have a level of
     * privilege on the storage credential.
     */
    get(request: model.GetAccountStorageCredentialRequest, context?: Context): Promise<model.StorageCredentialInfo>;
    private _list;
    /**
     * Get all storage credentials assigned to a metastore.
     *
     * Gets a list of all storage credentials that have been assigned to given
     * metastore.
     */
    list(request: model.ListAccountStorageCredentialsRequest, context?: Context): Promise<Array<model.StorageCredentialInfo>>;
}
export declare class CatalogsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class CatalogsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * A catalog is the first layer of Unity Catalog’s three-level namespace.
 * It’s used to organize your data assets. Users can see all catalogs on which
 * they have been assigned the USE_CATALOG data permission.
 *
 * In Unity Catalog, admins and data stewards manage users and their access to
 * data centrally across all of the workspaces in a Databricks account. Users in
 * different workspaces can share access to the same data, depending on
 * privileges granted centrally in Unity Catalog.
 */
export declare class CatalogsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a catalog.
     *
     * Creates a new catalog instance in the parent metastore if the caller is a
     * metastore admin or has the **CREATE_CATALOG** privilege.
     */
    create(request: model.CreateCatalog, context?: Context): Promise<model.CatalogInfo>;
    private _delete;
    /**
     * Delete a catalog.
     *
     * Deletes the catalog that matches the supplied name. The caller must be a
     * metastore admin or the owner of the catalog.
     */
    delete(request: model.DeleteCatalogRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get a catalog.
     *
     * Gets the specified catalog in a metastore. The caller must be a metastore
     * admin, the owner of the catalog, or a user that has the **USE_CATALOG**
     * privilege set for their account.
     */
    get(request: model.GetCatalogRequest, context?: Context): Promise<model.CatalogInfo>;
    private _list;
    /**
     * List catalogs.
     *
     * Gets an array of catalogs in the metastore. If the caller is the metastore
     * admin, all catalogs will be retrieved. Otherwise, only catalogs owned by
     * the caller (or for which the caller has the **USE_CATALOG** privilege)
     * will be retrieved. There is no guarantee of a specific ordering of the
     * elements in the array.
     */
    list(context?: Context): AsyncIterable<model.CatalogInfo>;
    private _update;
    /**
     * Update a catalog.
     *
     * Updates the catalog that matches the supplied name. The caller must be
     * either the owner of the catalog, or a metastore admin (when changing the
     * owner field of the catalog).
     */
    update(request: model.UpdateCatalog, context?: Context): Promise<model.CatalogInfo>;
}
export declare class ExternalLocationsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class ExternalLocationsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * An external location is an object that combines a cloud storage path with a
 * storage credential that authorizes access to the cloud storage path. Each
 * external location is subject to Unity Catalog access-control policies that
 * control which users and groups can access the credential. If a user does not
 * have access to an external location in Unity Catalog, the request fails and
 * Unity Catalog does not attempt to authenticate to your cloud tenant on the
 * user’s behalf.
 *
 * Databricks recommends using external locations rather than using storage
 * credentials directly.
 *
 * To create external locations, you must be a metastore admin or a user with the
 * **CREATE_EXTERNAL_LOCATION** privilege.
 */
export declare class ExternalLocationsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create an external location.
     *
     * Creates a new external location entry in the metastore. The caller must be
     * a metastore admin or have the **CREATE_EXTERNAL_LOCATION** privilege on
     * both the metastore and the associated storage credential.
     */
    create(request: model.CreateExternalLocation, context?: Context): Promise<model.ExternalLocationInfo>;
    private _delete;
    /**
     * Delete an external location.
     *
     * Deletes the specified external location from the metastore. The caller
     * must be the owner of the external location.
     */
    delete(request: model.DeleteExternalLocationRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get an external location.
     *
     * Gets an external location from the metastore. The caller must be either a
     * metastore admin, the owner of the external location, or a user that has
     * some privilege on the external location.
     */
    get(request: model.GetExternalLocationRequest, context?: Context): Promise<model.ExternalLocationInfo>;
    private _list;
    /**
     * List external locations.
     *
     * Gets an array of external locations (__ExternalLocationInfo__ objects)
     * from the metastore. The caller must be a metastore admin, the owner of the
     * external location, or a user that has some privilege on the external
     * location. There is no guarantee of a specific ordering of the elements in
     * the array.
     */
    list(context?: Context): AsyncIterable<model.ExternalLocationInfo>;
    private _update;
    /**
     * Update an external location.
     *
     * Updates an external location in the metastore. The caller must be the
     * owner of the external location, or be a metastore admin. In the second
     * case, the admin can only update the name of the external location.
     */
    update(request: model.UpdateExternalLocation, context?: Context): Promise<model.ExternalLocationInfo>;
}
export declare class FunctionsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class FunctionsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * Functions implement User-Defined Functions (UDFs) in Unity Catalog.
 *
 * The function implementation can be any SQL expression or Query, and it can be
 * invoked wherever a table reference is allowed in a query. In Unity Catalog, a
 * function resides at the same level as a table, so it can be referenced with
 * the form __catalog_name__.__schema_name__.__function_name__.
 */
export declare class FunctionsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a function.
     *
     * Creates a new function
     *
     * The user must have the following permissions in order for the function to
     * be created: - **USE_CATALOG** on the function's parent catalog -
     * **USE_SCHEMA** and **CREATE_FUNCTION** on the function's parent schema
     */
    create(request: model.CreateFunction, context?: Context): Promise<model.FunctionInfo>;
    private _delete;
    /**
     * Delete a function.
     *
     * Deletes the function that matches the supplied name. For the deletion to
     * succeed, the user must satisfy one of the following conditions: - Is the
     * owner of the function's parent catalog - Is the owner of the function's
     * parent schema and have the **USE_CATALOG** privilege on its parent catalog
     * - Is the owner of the function itself and have both the **USE_CATALOG**
     * privilege on its parent catalog and the **USE_SCHEMA** privilege on its
     * parent schema
     */
    delete(request: model.DeleteFunctionRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get a function.
     *
     * Gets a function from within a parent catalog and schema. For the fetch to
     * succeed, the user must satisfy one of the following requirements: - Is a
     * metastore admin - Is an owner of the function's parent catalog - Have the
     * **USE_CATALOG** privilege on the function's parent catalog and be the
     * owner of the function - Have the **USE_CATALOG** privilege on the
     * function's parent catalog, the **USE_SCHEMA** privilege on the function's
     * parent schema, and the **EXECUTE** privilege on the function itself
     */
    get(request: model.GetFunctionRequest, context?: Context): Promise<model.FunctionInfo>;
    private _list;
    /**
     * List functions.
     *
     * List functions within the specified parent catalog and schema. If the user
     * is a metastore admin, all functions are returned in the output list.
     * Otherwise, the user must have the **USE_CATALOG** privilege on the catalog
     * and the **USE_SCHEMA** privilege on the schema, and the output list
     * contains only functions for which either the user has the **EXECUTE**
     * privilege or the user is the owner. There is no guarantee of a specific
     * ordering of the elements in the array.
     */
    list(request: model.ListFunctionsRequest, context?: Context): Promise<model.ListFunctionsResponse>;
    private _update;
    /**
     * Update a function.
     *
     * Updates the function that matches the supplied name. Only the owner of the
     * function can be updated. If the user is not a metastore admin, the user
     * must be a member of the group that is the new function owner. - Is a
     * metastore admin - Is the owner of the function's parent catalog - Is the
     * owner of the function's parent schema and has the **USE_CATALOG**
     * privilege on its parent catalog - Is the owner of the function itself and
     * has the **USE_CATALOG** privilege on its parent catalog as well as the
     * **USE_SCHEMA** privilege on the function's parent schema.
     */
    update(request: model.UpdateFunction, context?: Context): Promise<model.FunctionInfo>;
}
export declare class GrantsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class GrantsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * In Unity Catalog, data is secure by default. Initially, users have no access
 * to data in a metastore. Access can be granted by either a metastore admin, the
 * owner of an object, or the owner of the catalog or schema that contains the
 * object. Securable objects in Unity Catalog are hierarchical and privileges are
 * inherited downward.
 *
 * Securable objects in Unity Catalog are hierarchical and privileges are
 * inherited downward. This means that granting a privilege on the catalog
 * automatically grants the privilege to all current and future objects within
 * the catalog. Similarly, privileges granted on a schema are inherited by all
 * current and future objects within that schema.
 */
export declare class GrantsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _get;
    /**
     * Get permissions.
     *
     * Gets the permissions for a securable.
     */
    get(request: model.GetGrantRequest, context?: Context): Promise<model.PermissionsList>;
    private _getEffective;
    /**
     * Get effective permissions.
     *
     * Gets the effective permissions for a securable.
     */
    getEffective(request: model.GetEffectiveRequest, context?: Context): Promise<model.EffectivePermissionsList>;
    private _update;
    /**
     * Update permissions.
     *
     * Updates the permissions for a securable.
     */
    update(request: model.UpdatePermissions, context?: Context): Promise<model.PermissionsList>;
}
export declare class MetastoresRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class MetastoresError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * A metastore is the top-level container of objects in Unity Catalog. It stores
 * data assets (tables and views) and the permissions that govern access to them.
 * Databricks account admins can create metastores and assign them to Databricks
 * workspaces to control which workloads use each metastore. For a workspace to
 * use Unity Catalog, it must have a Unity Catalog metastore attached.
 *
 * Each metastore is configured with a root storage location in a cloud storage
 * account. This storage location is used for metadata and managed tables data.
 *
 * NOTE: This metastore is distinct from the metastore included in Databricks
 * workspaces created before Unity Catalog was released. If your workspace
 * includes a legacy Hive metastore, the data in that metastore is available in a
 * catalog named hive_metastore.
 */
export declare class MetastoresService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _assign;
    /**
     * Create an assignment.
     *
     * Creates a new metastore assignment. If an assignment for the same
     * __workspace_id__ exists, it will be overwritten by the new
     * __metastore_id__ and __default_catalog_name__. The caller must be an
     * account admin.
     */
    assign(request: model.CreateMetastoreAssignment, context?: Context): Promise<model.EmptyResponse>;
    private _create;
    /**
     * Create a metastore.
     *
     * Creates a new metastore based on a provided name and storage root path.
     */
    create(request: model.CreateMetastore, context?: Context): Promise<model.MetastoreInfo>;
    private _current;
    /**
     * Get metastore assignment for workspace.
     *
     * Gets the metastore assignment for the workspace being accessed.
     */
    current(context?: Context): Promise<model.MetastoreAssignment>;
    private _delete;
    /**
     * Delete a metastore.
     *
     * Deletes a metastore. The caller must be a metastore admin.
     */
    delete(request: model.DeleteMetastoreRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get a metastore.
     *
     * Gets a metastore that matches the supplied ID. The caller must be a
     * metastore admin to retrieve this info.
     */
    get(request: model.GetMetastoreRequest, context?: Context): Promise<model.MetastoreInfo>;
    private _list;
    /**
     * List metastores.
     *
     * Gets an array of the available metastores (as __MetastoreInfo__ objects).
     * The caller must be an admin to retrieve this info. There is no guarantee
     * of a specific ordering of the elements in the array.
     */
    list(context?: Context): AsyncIterable<model.MetastoreInfo>;
    private _summary;
    /**
     * Get a metastore summary.
     *
     * Gets information about a metastore. This summary includes the storage
     * credential, the cloud vendor, the cloud region, and the global metastore
     * ID.
     */
    summary(context?: Context): Promise<model.GetMetastoreSummaryResponse>;
    private _unassign;
    /**
     * Delete an assignment.
     *
     * Deletes a metastore assignment. The caller must be an account
     * administrator.
     */
    unassign(request: model.UnassignRequest, context?: Context): Promise<model.EmptyResponse>;
    private _update;
    /**
     * Update a metastore.
     *
     * Updates information for a specific metastore. The caller must be a
     * metastore admin.
     */
    update(request: model.UpdateMetastore, context?: Context): Promise<model.MetastoreInfo>;
    private _updateAssignment;
    /**
     * Update an assignment.
     *
     * Updates a metastore assignment. This operation can be used to update
     * __metastore_id__ or __default_catalog_name__ for a specified Workspace, if
     * the Workspace is already assigned a metastore. The caller must be an
     * account admin to update __metastore_id__; otherwise, the caller can be a
     * Workspace admin.
     */
    updateAssignment(request: model.UpdateMetastoreAssignment, context?: Context): Promise<model.EmptyResponse>;
}
export declare class ProvidersRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class ProvidersError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * Databricks Delta Sharing: Providers REST API
 */
export declare class ProvidersService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create an auth provider.
     *
     * Creates a new authentication provider minimally based on a name and
     * authentication type. The caller must be an admin on the metastore.
     */
    create(request: model.CreateProvider, context?: Context): Promise<model.ProviderInfo>;
    private _delete;
    /**
     * Delete a provider.
     *
     * Deletes an authentication provider, if the caller is a metastore admin or
     * is the owner of the provider.
     */
    delete(request: model.DeleteProviderRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get a provider.
     *
     * Gets a specific authentication provider. The caller must supply the name
     * of the provider, and must either be a metastore admin or the owner of the
     * provider.
     */
    get(request: model.GetProviderRequest, context?: Context): Promise<model.ProviderInfo>;
    private _list;
    /**
     * List providers.
     *
     * Gets an array of available authentication providers. The caller must
     * either be a metastore admin or the owner of the providers. Providers not
     * owned by the caller are not included in the response. There is no
     * guarantee of a specific ordering of the elements in the array.
     */
    list(request: model.ListProvidersRequest, context?: Context): AsyncIterable<model.ProviderInfo>;
    private _listShares;
    /**
     * List shares by Provider.
     *
     * Gets an array of a specified provider's shares within the metastore where:
     *
     * * the caller is a metastore admin, or * the caller is the owner.
     */
    listShares(request: model.ListSharesRequest, context?: Context): Promise<model.ListProviderSharesResponse>;
    private _update;
    /**
     * Update a provider.
     *
     * Updates the information for an authentication provider, if the caller is a
     * metastore admin or is the owner of the provider. If the update changes the
     * provider name, the caller must be both a metastore admin and the owner of
     * the provider.
     */
    update(request: model.UpdateProvider, context?: Context): Promise<model.ProviderInfo>;
}
export declare class RecipientActivationRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class RecipientActivationError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * Databricks Delta Sharing: Recipient Activation REST API
 */
export declare class RecipientActivationService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _getActivationUrlInfo;
    /**
     * Get a share activation URL.
     *
     * Gets an activation URL for a share.
     */
    getActivationUrlInfo(request: model.GetActivationUrlInfoRequest, context?: Context): Promise<model.EmptyResponse>;
    private _retrieveToken;
    /**
     * Get an access token.
     *
     * Retrieve access token with an activation url. This is a public API without
     * any authentication.
     */
    retrieveToken(request: model.RetrieveTokenRequest, context?: Context): Promise<model.RetrieveTokenResponse>;
}
export declare class RecipientsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class RecipientsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * Databricks Delta Sharing: Recipients REST API
 */
export declare class RecipientsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a share recipient.
     *
     * Creates a new recipient with the delta sharing authentication type in the
     * metastore. The caller must be a metastore admin or has the
     * **CREATE_RECIPIENT** privilege on the metastore.
     */
    create(request: model.CreateRecipient, context?: Context): Promise<model.RecipientInfo>;
    private _delete;
    /**
     * Delete a share recipient.
     *
     * Deletes the specified recipient from the metastore. The caller must be the
     * owner of the recipient.
     */
    delete(request: model.DeleteRecipientRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get a share recipient.
     *
     * Gets a share recipient from the metastore if:
     *
     * * the caller is the owner of the share recipient, or: * is a metastore
     * admin
     */
    get(request: model.GetRecipientRequest, context?: Context): Promise<model.RecipientInfo>;
    private _list;
    /**
     * List share recipients.
     *
     * Gets an array of all share recipients within the current metastore where:
     *
     * * the caller is a metastore admin, or * the caller is the owner. There is
     * no guarantee of a specific ordering of the elements in the array.
     */
    list(request: model.ListRecipientsRequest, context?: Context): AsyncIterable<model.RecipientInfo>;
    private _rotateToken;
    /**
     * Rotate a token.
     *
     * Refreshes the specified recipient's delta sharing authentication token
     * with the provided token info. The caller must be the owner of the
     * recipient.
     */
    rotateToken(request: model.RotateRecipientToken, context?: Context): Promise<model.RecipientInfo>;
    private _sharePermissions;
    /**
     * Get recipient share permissions.
     *
     * Gets the share permissions for the specified Recipient. The caller must be
     * a metastore admin or the owner of the Recipient.
     */
    sharePermissions(request: model.SharePermissionsRequest, context?: Context): Promise<model.GetRecipientSharePermissionsResponse>;
    private _update;
    /**
     * Update a share recipient.
     *
     * Updates an existing recipient in the metastore. The caller must be a
     * metastore admin or the owner of the recipient. If the recipient name will
     * be updated, the user must be both a metastore admin and the owner of the
     * recipient.
     */
    update(request: model.UpdateRecipient, context?: Context): Promise<model.EmptyResponse>;
}
export declare class SchemasRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class SchemasError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * A schema (also called a database) is the second layer of Unity Catalog’s
 * three-level namespace. A schema organizes tables, views and functions. To
 * access (or list) a table or view in a schema, users must have the USE_SCHEMA
 * data permission on the schema and its parent catalog, and they must have the
 * SELECT permission on the table or view.
 */
export declare class SchemasService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a schema.
     *
     * Creates a new schema for catalog in the Metatastore. The caller must be a
     * metastore admin, or have the **CREATE_SCHEMA** privilege in the parent
     * catalog.
     */
    create(request: model.CreateSchema, context?: Context): Promise<model.SchemaInfo>;
    private _delete;
    /**
     * Delete a schema.
     *
     * Deletes the specified schema from the parent catalog. The caller must be
     * the owner of the schema or an owner of the parent catalog.
     */
    delete(request: model.DeleteSchemaRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get a schema.
     *
     * Gets the specified schema within the metastore. The caller must be a
     * metastore admin, the owner of the schema, or a user that has the
     * **USE_SCHEMA** privilege on the schema.
     */
    get(request: model.GetSchemaRequest, context?: Context): Promise<model.SchemaInfo>;
    private _list;
    /**
     * List schemas.
     *
     * Gets an array of schemas for a catalog in the metastore. If the caller is
     * the metastore admin or the owner of the parent catalog, all schemas for
     * the catalog will be retrieved. Otherwise, only schemas owned by the caller
     * (or for which the caller has the **USE_SCHEMA** privilege) will be
     * retrieved. There is no guarantee of a specific ordering of the elements in
     * the array.
     */
    list(request: model.ListSchemasRequest, context?: Context): AsyncIterable<model.SchemaInfo>;
    private _update;
    /**
     * Update a schema.
     *
     * Updates a schema for a catalog. The caller must be the owner of the schema
     * or a metastore admin. If the caller is a metastore admin, only the
     * __owner__ field can be changed in the update. If the __name__ field must
     * be updated, the caller must be a metastore admin or have the
     * **CREATE_SCHEMA** privilege on the parent catalog.
     */
    update(request: model.UpdateSchema, context?: Context): Promise<model.SchemaInfo>;
}
export declare class SharesRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class SharesError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * Databricks Delta Sharing: Shares REST API
 */
export declare class SharesService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a share.
     *
     * Creates a new share for data objects. Data objects can be added at this
     * time or after creation with **update**. The caller must be a metastore
     * admin or have the **CREATE_SHARE** privilege on the metastore.
     */
    create(request: model.CreateShare, context?: Context): Promise<model.ShareInfo>;
    private _delete;
    /**
     * Delete a share.
     *
     * Deletes a data object share from the metastore. The caller must be an
     * owner of the share.
     */
    delete(request: model.DeleteShareRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get a share.
     *
     * Gets a data object share from the metastore. The caller must be a
     * metastore admin or the owner of the share.
     */
    get(request: model.GetShareRequest, context?: Context): Promise<model.ShareInfo>;
    private _list;
    /**
     * List shares.
     *
     * Gets an array of data object shares from the metastore. The caller must be
     * a metastore admin or the owner of the share. There is no guarantee of a
     * specific ordering of the elements in the array.
     */
    list(context?: Context): AsyncIterable<model.ShareInfo>;
    private _sharePermissions;
    /**
     * Get permissions.
     *
     * Gets the permissions for a data share from the metastore. The caller must
     * be a metastore admin or the owner of the share.
     */
    sharePermissions(request: model.SharePermissionsRequest, context?: Context): Promise<model.PermissionsList>;
    private _update;
    /**
     * Update a share.
     *
     * Updates the share with the changes and data objects in the request. The
     * caller must be the owner of the share or a metastore admin.
     *
     * When the caller is a metastore admin, only the __owner__ field can be
     * updated.
     *
     * In the case that the share name is changed, **updateShare** requires that
     * the caller is both the share owner and a metastore admin.
     *
     * For each table that is added through this method, the share owner must
     * also have **SELECT** privilege on the table. This privilege must be
     * maintained indefinitely for recipients to be able to access the table.
     * Typically, you should use a group as the share owner.
     *
     * Table removals through **update** do not require additional privileges.
     */
    update(request: model.UpdateShare, context?: Context): Promise<model.ShareInfo>;
    private _updatePermissions;
    /**
     * Update permissions.
     *
     * Updates the permissions for a data share in the metastore. The caller must
     * be a metastore admin or an owner of the share.
     *
     * For new recipient grants, the user must also be the owner of the
     * recipients. recipient revocations do not require additional privileges.
     */
    updatePermissions(request: model.UpdateSharePermissions, context?: Context): Promise<model.EmptyResponse>;
}
export declare class StorageCredentialsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class StorageCredentialsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * A storage credential represents an authentication and authorization mechanism
 * for accessing data stored on your cloud tenant. Each storage credential is
 * subject to Unity Catalog access-control policies that control which users and
 * groups can access the credential. If a user does not have access to a storage
 * credential in Unity Catalog, the request fails and Unity Catalog does not
 * attempt to authenticate to your cloud tenant on the user’s behalf.
 *
 * Databricks recommends using external locations rather than using storage
 * credentials directly.
 *
 * To create storage credentials, you must be a Databricks account admin. The
 * account admin who creates the storage credential can delegate ownership to
 * another user or group to manage permissions on it.
 */
export declare class StorageCredentialsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a storage credential.
     *
     * Creates a new storage credential. The request object is specific to the
     * cloud:
     *
     * * **AwsIamRole** for AWS credentials * **AzureServicePrincipal** for Azure
     * credentials * **GcpServiceAcountKey** for GCP credentials.
     *
     * The caller must be a metastore admin and have the
     * **CREATE_STORAGE_CREDENTIAL** privilege on the metastore.
     */
    create(request: model.CreateStorageCredential, context?: Context): Promise<model.StorageCredentialInfo>;
    private _delete;
    /**
     * Delete a credential.
     *
     * Deletes a storage credential from the metastore. The caller must be an
     * owner of the storage credential.
     */
    delete(request: model.DeleteStorageCredentialRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get a credential.
     *
     * Gets a storage credential from the metastore. The caller must be a
     * metastore admin, the owner of the storage credential, or have some
     * permission on the storage credential.
     */
    get(request: model.GetStorageCredentialRequest, context?: Context): Promise<model.StorageCredentialInfo>;
    private _list;
    /**
     * List credentials.
     *
     * Gets an array of storage credentials (as __StorageCredentialInfo__
     * objects). The array is limited to only those storage credentials the
     * caller has permission to access. If the caller is a metastore admin, all
     * storage credentials will be retrieved. There is no guarantee of a specific
     * ordering of the elements in the array.
     */
    list(context?: Context): Promise<Array<model.StorageCredentialInfo>>;
    private _update;
    /**
     * Update a credential.
     *
     * Updates a storage credential on the metastore. The caller must be the
     * owner of the storage credential or a metastore admin. If the caller is a
     * metastore admin, only the __owner__ credential can be changed.
     */
    update(request: model.UpdateStorageCredential, context?: Context): Promise<model.StorageCredentialInfo>;
    private _validate;
    /**
     * Validate a storage credential.
     *
     * Validates a storage credential. At least one of __external_location_name__
     * and __url__ need to be provided. If only one of them is provided, it will
     * be used for validation. And if both are provided, the __url__ will be used
     * for validation, and __external_location_name__ will be ignored when
     * checking overlapping urls.
     *
     * Either the __storage_credential_name__ or the cloud-specific credential
     * must be provided.
     *
     * The caller must be a metastore admin or the storage credential owner or
     * have the **CREATE_EXTERNAL_LOCATION** privilege on the metastore and the
     * storage credential.
     */
    validate(request: model.ValidateStorageCredential, context?: Context): Promise<model.ValidateStorageCredentialResponse>;
}
export declare class TableConstraintsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class TableConstraintsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * Primary key and foreign key constraints encode relationships between fields in
 * tables.
 *
 * Primary and foreign keys are informational only and are not enforced. Foreign
 * keys must reference a primary key in another table. This primary key is the
 * parent constraint of the foreign key and the table this primary key is on is
 * the parent table of the foreign key. Similarly, the foreign key is the child
 * constraint of its referenced primary key; the table of the foreign key is the
 * child table of the primary key.
 *
 * You can declare primary keys and foreign keys as part of the table
 * specification during table creation. You can also add or drop constraints on
 * existing tables.
 */
export declare class TableConstraintsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a table constraint.
     *
     * Creates a new table constraint.
     *
     * For the table constraint creation to succeed, the user must satisfy both
     * of these conditions: - the user must have the **USE_CATALOG** privilege on
     * the table's parent catalog, the **USE_SCHEMA** privilege on the table's
     * parent schema, and be the owner of the table. - if the new constraint is a
     * __ForeignKeyConstraint__, the user must have the **USE_CATALOG** privilege
     * on the referenced parent table's catalog, the **USE_SCHEMA** privilege on
     * the referenced parent table's schema, and be the owner of the referenced
     * parent table.
     */
    create(request: model.CreateTableConstraint, context?: Context): Promise<model.TableConstraint>;
    private _delete;
    /**
     * Delete a table constraint.
     *
     * Deletes a table constraint.
     *
     * For the table constraint deletion to succeed, the user must satisfy both
     * of these conditions: - the user must have the **USE_CATALOG** privilege on
     * the table's parent catalog, the **USE_SCHEMA** privilege on the table's
     * parent schema, and be the owner of the table. - if __cascade__ argument is
     * **true**, the user must have the following permissions on all of the child
     * tables: the **USE_CATALOG** privilege on the table's catalog, the
     * **USE_SCHEMA** privilege on the table's schema, and be the owner of the
     * table.
     */
    delete(request: model.DeleteTableConstraintRequest, context?: Context): Promise<model.EmptyResponse>;
}
export declare class TablesRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class TablesError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * A table resides in the third layer of Unity Catalog’s three-level namespace.
 * It contains rows of data. To create a table, users must have CREATE_TABLE and
 * USE_SCHEMA permissions on the schema, and they must have the USE_CATALOG
 * permission on its parent catalog. To query a table, users must have the SELECT
 * permission on the table, and they must have the USE_CATALOG permission on its
 * parent catalog and the USE_SCHEMA permission on its parent schema.
 *
 * A table can be managed or external. From an API perspective, a __VIEW__ is a
 * particular kind of table (rather than a managed or external table).
 */
export declare class TablesService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _delete;
    /**
     * Delete a table.
     *
     * Deletes a table from the specified parent catalog and schema. The caller
     * must be the owner of the parent catalog, have the **USE_CATALOG**
     * privilege on the parent catalog and be the owner of the parent schema, or
     * be the owner of the table and have the **USE_CATALOG** privilege on the
     * parent catalog and the **USE_SCHEMA** privilege on the parent schema.
     */
    delete(request: model.DeleteTableRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get a table.
     *
     * Gets a table from the metastore for a specific catalog and schema. The
     * caller must be a metastore admin, be the owner of the table and have the
     * **USE_CATALOG** privilege on the parent catalog and the **USE_SCHEMA**
     * privilege on the parent schema, or be the owner of the table and have the
     * **SELECT** privilege on it as well.
     */
    get(request: model.GetTableRequest, context?: Context): Promise<model.TableInfo>;
    private _list;
    /**
     * List tables.
     *
     * Gets an array of all tables for the current metastore under the parent
     * catalog and schema. The caller must be a metastore admin or an owner of
     * (or have the **SELECT** privilege on) the table. For the latter case, the
     * caller must also be the owner or have the **USE_CATALOG** privilege on the
     * parent catalog and the **USE_SCHEMA** privilege on the parent schema.
     * There is no guarantee of a specific ordering of the elements in the array.
     */
    list(request: model.ListTablesRequest, context?: Context): AsyncIterable<model.TableInfo>;
    private _listSummaries;
    /**
     * List table summaries.
     *
     * Gets an array of summaries for tables for a schema and catalog within the
     * metastore. The table summaries returned are either:
     *
     * * summaries for all tables (within the current metastore and parent
     * catalog and schema), when the user is a metastore admin, or: * summaries
     * for all tables and schemas (within the current metastore and parent
     * catalog) for which the user has ownership or the **SELECT** privilege on
     * the table and ownership or **USE_SCHEMA** privilege on the schema,
     * provided that the user also has ownership or the **USE_CATALOG** privilege
     * on the parent catalog.
     *
     * There is no guarantee of a specific ordering of the elements in the array.
     */
    listSummaries(request: model.ListSummariesRequest, context?: Context): Promise<model.ListTableSummariesResponse>;
}
//# sourceMappingURL=api.d.ts.map