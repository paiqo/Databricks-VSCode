"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionContext = void 0;
const commands_1 = require("../apis/commands");
const retries_1 = require("../retries/retries");
const Command_1 = require("./Command");
class ExecutionContext {
    constructor(client, cluster, language) {
        this.client = client;
        this.cluster = cluster;
        this.language = language;
        this.executionContextApi = new commands_1.CommandExecutionService(client);
    }
    static async create(client, cluster, language = "python") {
        const context = new ExecutionContext(client, cluster, language);
        const response = await (await context.executionContextApi.create({
            clusterId: context.cluster.id,
            language: context.language,
        })).wait();
        context.id = response.id;
        return context;
    }
    async execute(command, onStatusUpdate = () => { }, token, timeout = retries_1.DEFAULT_MAX_TIMEOUT) {
        return await Command_1.Command.execute(this, command, onStatusUpdate, token, timeout);
    }
    async destroy() {
        if (!this.id) {
            return;
        }
        await this.executionContextApi.destroy({
            clusterId: this.cluster.id,
            contextId: this.id,
        });
    }
}
exports.ExecutionContext = ExecutionContext;
//# sourceMappingURL=ExecutionContext.js.map