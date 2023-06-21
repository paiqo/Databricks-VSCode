"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyFamiliesService = exports.PolicyFamiliesError = exports.PolicyFamiliesRetriableError = exports.ClusterPoliciesService = exports.ClusterPoliciesError = exports.ClusterPoliciesRetriableError = void 0;
const model = __importStar(require("./model"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
class ClusterPoliciesRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("ClusterPolicies", method, message);
    }
}
exports.ClusterPoliciesRetriableError = ClusterPoliciesRetriableError;
class ClusterPoliciesError extends apiError_1.ApiError {
    constructor(method, message) {
        super("ClusterPolicies", method, message);
    }
}
exports.ClusterPoliciesError = ClusterPoliciesError;
/**
 * Cluster policy limits the ability to configure clusters based on a set of
 * rules. The policy rules limit the attributes or attribute values available for
 * cluster creation. Cluster policies have ACLs that limit their use to specific
 * users and groups.
 *
 * Cluster policies let you limit users to create clusters with prescribed
 * settings, simplify the user interface and enable more users to create their
 * own clusters (by fixing and hiding some values), control cost by limiting per
 * cluster maximum cost (by setting limits on attributes whose values contribute
 * to hourly price).
 *
 * Cluster policy permissions limit which policies a user can select in the
 * Policy drop-down when the user creates a cluster: - A user who has cluster
 * create permission can select the Unrestricted policy and create
 * fully-configurable clusters. - A user who has both cluster create permission
 * and access to cluster policies can select the Unrestricted policy and policies
 * they have access to. - A user that has access to only cluster policies, can
 * select the policies they have access to.
 *
 * If no policies have been created in the workspace, the Policy drop-down does
 * not display.
 *
 * Only admin users can create, edit, and delete policies. Admin users also have
 * access to all policies.
 */
class ClusterPoliciesService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.0/policies/clusters/create";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a new policy.
     *
     * Creates a new policy with prescribed settings.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = "/api/2.0/policies/clusters/delete";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Delete a cluster policy.
     *
     * Delete a policy for a cluster. Clusters governed by this policy can still
     * run, but cannot be edited.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _edit(request, context) {
        const path = "/api/2.0/policies/clusters/edit";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Update a cluster policy.
     *
     * Update an existing policy for cluster. This operation may make some
     * clusters governed by the previous policy invalid.
     */
    async edit(request, context) {
        return await this._edit(request, context);
    }
    async _get(request, context) {
        const path = "/api/2.0/policies/clusters/get";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get entity.
     *
     * Get a cluster policy entity. Creation and editing is available to admins
     * only.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.0/policies/clusters/list";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a cluster policy.
     *
     * Returns a list of policies accessible by the requesting user.
     */
    async *list(request, context) {
        const response = (await this._list(request, context)).policies;
        for (const v of response || []) {
            yield v;
        }
    }
}
exports.ClusterPoliciesService = ClusterPoliciesService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClusterPoliciesService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClusterPoliciesService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClusterPoliciesService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClusterPoliciesService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClusterPoliciesService.prototype, "_edit", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClusterPoliciesService.prototype, "edit", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClusterPoliciesService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClusterPoliciesService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClusterPoliciesService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], ClusterPoliciesService.prototype, "list", null);
class PolicyFamiliesRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("PolicyFamilies", method, message);
    }
}
exports.PolicyFamiliesRetriableError = PolicyFamiliesRetriableError;
class PolicyFamiliesError extends apiError_1.ApiError {
    constructor(method, message) {
        super("PolicyFamilies", method, message);
    }
}
exports.PolicyFamiliesError = PolicyFamiliesError;
/**
 * View available policy families. A policy family contains a policy definition
 * providing best practices for configuring clusters for a particular use case.
 *
 * Databricks manages and provides policy families for several common cluster use
 * cases. You cannot create, edit, or delete policy families.
 *
 * Policy families cannot be used directly to create clusters. Instead, you
 * create cluster policies using a policy family. Cluster policies created using
 * a policy family inherit the policy family's policy definition.
 */
class PolicyFamiliesService {
    constructor(client) {
        this.client = client;
    }
    async _get(request, context) {
        const path = `/api/2.0/policy-families/${request.policy_family_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
        
        */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.0/policy-families";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
        
        */
    async *list(request, context) {
        while (true) {
            const response = await this._list(request, context);
            if (context?.cancellationToken &&
                context?.cancellationToken.isCancellationRequested) {
                break;
            }
            if (!response.policy_families ||
                response.policy_families.length === 0) {
                break;
            }
            for (const v of response.policy_families) {
                yield v;
            }
            request.page_token = response.next_page_token;
            if (!response.next_page_token) {
                break;
            }
        }
    }
}
exports.PolicyFamiliesService = PolicyFamiliesService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PolicyFamiliesService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PolicyFamiliesService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PolicyFamiliesService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], PolicyFamiliesService.prototype, "list", null);
//# sourceMappingURL=api.js.map