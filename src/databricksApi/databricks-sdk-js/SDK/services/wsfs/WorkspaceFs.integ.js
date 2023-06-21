"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const crypto_1 = require("crypto");
const path_1 = require("path");
const posix_1 = __importDefault(require("path/posix"));
const IntegrationTestSetup_1 = require("../../test/IntegrationTestSetup");
const utils_1 = require("./utils");
const WorkspaceFsEntity_1 = require("./WorkspaceFsEntity");
describe(__filename, function () {
    let integSetup;
    let testDirPath;
    let rootDir;
    this.timeout(10 * 60 * 1000);
    before(async () => {
        integSetup = await IntegrationTestSetup_1.IntegrationTestSetup.getInstance();
        const me = (await integSetup.client.currentUser.me()).userName;
        assert_1.default.ok(me !== undefined, "No currentUser.userName");
        testDirPath = `/Users/${me}/vscode-integ-tests/${(0, crypto_1.randomUUID)()}`;
        await integSetup.client.workspace.mkdirs({
            path: testDirPath,
        });
    });
    after(async () => {
        try {
            await integSetup.client.workspace.delete({
                path: testDirPath,
                recursive: true,
            });
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Can't cleanup ${testDirPath}`, e);
        }
    });
    beforeEach(async () => {
        const dir = await WorkspaceFsEntity_1.WorkspaceFsEntity.fromPath(integSetup.client, testDirPath);
        assert_1.default.ok(dir !== undefined);
        assert_1.default.ok((0, utils_1.isDirectory)(dir));
        rootDir = dir;
    });
    it("should should create a directory", async () => {
        const dirPath = `test-${(0, crypto_1.randomUUID)()}`;
        const createdDir = await rootDir.mkdir(dirPath);
        assert_1.default.ok(createdDir !== undefined);
        assert_1.default.ok(createdDir.type === "DIRECTORY");
        assert_1.default.ok(createdDir.path === path_1.posix.join(testDirPath, dirPath));
        assert_1.default.ok((await createdDir.parent)?.path === testDirPath);
    });
    it("should list a directory", async () => {
        const newDirs = [];
        for (let i = 0; i < 5; i++) {
            const dirName = `test-${(0, crypto_1.randomUUID)()}`;
            newDirs.push(dirName);
            await rootDir.mkdir(dirName);
        }
        const actual = await rootDir.children;
        newDirs.forEach((dirName) => {
            assert_1.default.ok(actual.find((e) => e.path === path_1.posix.join(testDirPath, dirName)) !== undefined);
        });
    });
    it("should not allow creation of directory in invalid paths", async () => {
        const dirName = `test-${(0, crypto_1.randomUUID)()}`;
        const dir = await rootDir.mkdir(dirName);
        assert_1.default.ok(dir !== undefined);
        await assert_1.default.rejects(async () => await dir.mkdir("/a"));
        await assert_1.default.rejects(async () => await dir.mkdir("../../a"));
        await assert_1.default.doesNotReject(async () => await dir.mkdir(`../${dirName}/a`));
    });
    it("should create a file", async () => {
        const file = await rootDir.createFile("test.txt", "some content");
        assert_1.default.ok(file?.details.path === posix_1.default.join(rootDir.path, "test.txt"));
        const content = await integSetup.client.workspace.export({
            path: file.details.path,
            format: "AUTO",
        });
        assert_1.default.ok(content.content !== undefined);
        const buff = Buffer.from(content.content, "base64");
        assert_1.default.equal(buff.toString("utf-8"), "some content");
    });
});
//# sourceMappingURL=WorkspaceFs.integ.js.map