"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const path_1 = require("path");
const ts_mockito_1 = require("ts-mockito");
const workspace_1 = require("../../apis/workspace");
const WorkspaceClient_1 = require("../../WorkspaceClient");
const utils_1 = require("./utils");
const WorkspaceFsEntity_1 = require("./WorkspaceFsEntity");
describe(__filename, () => {
    let mockWorkspaceClient;
    let mockWorkspaceService;
    before(() => {
        mockWorkspaceClient = (0, ts_mockito_1.mock)(WorkspaceClient_1.WorkspaceClient);
        mockWorkspaceService = (0, ts_mockito_1.mock)(workspace_1.WorkspaceService);
        (0, ts_mockito_1.when)(mockWorkspaceClient.workspace).thenReturn((0, ts_mockito_1.instance)(mockWorkspaceService));
    });
    function mockDirectory(path) {
        (0, ts_mockito_1.when)(mockWorkspaceService.getStatus((0, ts_mockito_1.deepEqual)({ path }), (0, ts_mockito_1.anything)())).thenResolve({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            object_type: "DIRECTORY",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            object_id: 123,
            path: path,
        });
    }
    it("should return correct absolute child path", async () => {
        const path = "/root/a/b";
        mockDirectory(path);
        const root = await WorkspaceFsEntity_1.WorkspaceFsEntity.fromPath((0, ts_mockito_1.instance)(mockWorkspaceClient), path);
        assert_1.default.ok((0, utils_1.isDirectory)(root));
        assert_1.default.equal(root.getAbsoluteChildPath(path), path);
        assert_1.default.equal(root.getAbsoluteChildPath(path_1.posix.resolve(path, "..", "..")), undefined);
        assert_1.default.equal(root.getAbsoluteChildPath(path_1.posix.resolve(path, "..")), undefined);
        assert_1.default.ok(root.getAbsoluteChildPath(path_1.posix.resolve(path, "c", "..", "..")) ===
            undefined);
        assert_1.default.ok(root.getAbsoluteChildPath(path_1.posix.resolve(path, "c", "d")) ===
            path_1.posix.resolve(path, "c", "d"));
    });
});
//# sourceMappingURL=WorkspaceFsDir.test.js.map