"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var CodeSubmitResponse = (function () {
    function CodeSubmitResponse(status, chestType) {
        this.status = status;
        this.chestType = chestType;
    }
    return CodeSubmitResponse;
}());
var CodeSubmitStatus;
(function (CodeSubmitStatus) {
    CodeSubmitStatus[CodeSubmitStatus["Success"] = 0] = "Success";
    CodeSubmitStatus[CodeSubmitStatus["OutdatedInstanceId"] = 1] = "OutdatedInstanceId";
    CodeSubmitStatus[CodeSubmitStatus["AlreadyRedeemed"] = 2] = "AlreadyRedeemed";
    CodeSubmitStatus[CodeSubmitStatus["InvalidParameters"] = 3] = "InvalidParameters";
    CodeSubmitStatus[CodeSubmitStatus["NotValidCombo"] = 4] = "NotValidCombo";
    CodeSubmitStatus[CodeSubmitStatus["Expired"] = 5] = "Expired";
    CodeSubmitStatus[CodeSubmitStatus["Failed"] = 6] = "Failed";
})(CodeSubmitStatus || (CodeSubmitStatus = {}));
var IdleChampionsApi = (function () {
    function IdleChampionsApi() {
    }
    IdleChampionsApi.getServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, serverDefs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new URL('https://master.idlechampions.com/~idledragons/post.php');
                        request.searchParams.append("call", "getPlayServerForDefinitions");
                        request.searchParams.append("mobile_client_version", "999");
                        request.searchParams.append("network_id", IdleChampionsApi.NETWORK_ID);
                        request.searchParams.append("timestamp", "0");
                        request.searchParams.append("request_id", "0");
                        request.searchParams.append("localization_aware", "true");
                        return [4, fetch(request.toString())];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3, 3];
                        return [4, response.json()];
                    case 2:
                        serverDefs = _a.sent();
                        return [2, serverDefs.play_server + "post.php"];
                    case 3: return [2, undefined];
                }
            });
        });
    };
    IdleChampionsApi.submitCode = function (options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var request, response, redeemResponse, chestType;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        request = new URL(options.server);
                        request.searchParams.append("call", "redeemcoupon");
                        request.searchParams.append("user_id", options.user_id);
                        request.searchParams.append("hash", options.hash);
                        request.searchParams.append("code", options.code);
                        request.searchParams.append("instance_id", options.instanceId);
                        request.searchParams.append("timestamp", "0");
                        request.searchParams.append("request_id", "0");
                        request.searchParams.append("language_id", IdleChampionsApi.LANGUAGE_ID);
                        request.searchParams.append("network_id", IdleChampionsApi.NETWORK_ID);
                        request.searchParams.append("mobile_client_version", IdleChampionsApi.CLIENT_VERSION);
                        request.searchParams.append("localization_aware", "true");
                        return [4, fetch(request.toString())];
                    case 1:
                        response = _c.sent();
                        if (!response.ok) return [3, 3];
                        return [4, response.json()];
                    case 2:
                        redeemResponse = _c.sent();
                        if (!redeemResponse) {
                            console.error("No json response");
                            return [2, new CodeSubmitResponse(CodeSubmitStatus.Failed)];
                        }
                        console.debug(redeemResponse);
                        if (redeemResponse.success && redeemResponse.failure_reason === "you_already_redeemed_combination") {
                            return [2, new CodeSubmitResponse(CodeSubmitStatus.AlreadyRedeemed)];
                        }
                        if (redeemResponse.success && redeemResponse.failure_reason === "offer_has_expired") {
                            return [2, new CodeSubmitResponse(CodeSubmitStatus.Expired)];
                        }
                        if (redeemResponse.success && redeemResponse.failure_reason === "not_valid_combination") {
                            return [2, new CodeSubmitResponse(CodeSubmitStatus.NotValidCombo)];
                        }
                        if (redeemResponse.success) {
                            chestType = (_b = (_a = redeemResponse === null || redeemResponse === void 0 ? void 0 : redeemResponse.loot_details) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.chest_type_id;
                            return [2, new CodeSubmitResponse(CodeSubmitStatus.Success, chestType)];
                        }
                        if (!redeemResponse.success && redeemResponse.failure_reason === "Outdated instance id") {
                            return [2, new CodeSubmitResponse(CodeSubmitStatus.OutdatedInstanceId)];
                        }
                        if (!redeemResponse.success && redeemResponse.failure_reason === "Invalid or incomplete parameters") {
                            return [2, new CodeSubmitResponse(CodeSubmitStatus.InvalidParameters)];
                        }
                        console.error("Unknown failure reason");
                        return [2, new CodeSubmitResponse(CodeSubmitStatus.Failed)];
                    case 3: return [2, new CodeSubmitResponse(CodeSubmitStatus.Failed)];
                }
            });
        });
    };
    IdleChampionsApi.getUserDetails = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, playerData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new URL(options.server);
                        request.searchParams.append("call", "getuserdetails");
                        request.searchParams.append("user_id", options.user_id);
                        request.searchParams.append("hash", options.hash);
                        request.searchParams.append("instance_key", "0");
                        request.searchParams.append("include_free_play_objectives", "true");
                        request.searchParams.append("timestamp", "0");
                        request.searchParams.append("request_id", "0");
                        request.searchParams.append("language_id", IdleChampionsApi.LANGUAGE_ID);
                        request.searchParams.append("network_id", IdleChampionsApi.NETWORK_ID);
                        request.searchParams.append("mobile_client_version", IdleChampionsApi.CLIENT_VERSION);
                        request.searchParams.append("localization_aware", "true");
                        return [4, fetch(request.toString())];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3, 3];
                        return [4, response.json()];
                    case 2:
                        playerData = _a.sent();
                        if (playerData.success) {
                            return [2, playerData];
                        }
                        _a.label = 3;
                    case 3: return [2, undefined];
                }
            });
        });
    };
    IdleChampionsApi.MAX_CODES_QUOTA = 200;
    IdleChampionsApi.CLIENT_VERSION = "999";
    IdleChampionsApi.NETWORK_ID = "21";
    IdleChampionsApi.LANGUAGE_ID = "1";
    return IdleChampionsApi;
}());
var Globals = (function () {
    function Globals() {
    }
    Globals.debugMode = !chrome.runtime.getManifest().update_url;
    Globals.discordChannelUrl = "https://discord.com/channels/357247482247380994/358044869685673985";
    Globals.SETTING_CODES = "redeemedCodes";
    Globals.SETTING_PENDING = "pendingCodes";
    Globals.SETTING_INSTANCE_ID = "instanceId";
    Globals.SETTING_USER_HASH = "userHash";
    Globals.SETTING_USER_ID = "userId";
    return Globals;
}());
chrome.action.setIcon({ "path": "media/icon-enabled.png" }, function () { });
var _waitingForPort = false;
chrome.runtime.onConnect.addListener(function (port) {
    if (_waitingForPort) {
        console.log("New port opened.");
        _waitingForPort = false;
        port.onMessage.addListener(onPortMessage);
    }
    else {
        console.log("Unexpected port, disconnecting.");
        port.disconnect();
    }
});
function onPortMessage(message, port) {
    switch (message.messageType) {
        case "pageReady":
            console.log("Page ready message");
            port.postMessage({ messageType: "scanCodes" });
            break;
        case "codes":
            console.log("Code message received");
            chrome.storage.sync.get([Globals.SETTING_CODES, Globals.SETTING_PENDING], function (_a) {
                var redeemedCodes = _a.redeemedCodes, pendingCodes = _a.pendingCodes;
                handleDetectedCodes(redeemedCodes, pendingCodes, message.codes);
            });
            port.postMessage({ messageType: "closeTab" });
            port.disconnect();
            break;
    }
}
chrome.runtime.onMessage.addListener(onRuntimeMessage);
function onRuntimeMessage(message, sender, sendResponse) {
    var _a;
    if (message.messageType == "startScanProcess") {
        chrome.runtime.sendMessage({ messageType: "info", messageText: "Opening discord tab to scan for codes." });
        console.log("Starting scan/upolad process. Opening discord tab.");
        _waitingForPort = true;
        chrome.tabs.create({ url: Globals.discordChannelUrl });
        if ((_a = sender === null || sender === void 0 ? void 0 : sender.tab) === null || _a === void 0 ? void 0 : _a.id) {
            chrome.tabs.update(sender.tab.id, { 'active': true });
        }
    }
}
chrome.action.onClicked.addListener(browserActionClicked);
function browserActionClicked(tab) {
    chrome.tabs.create({ url: "dst/options.html" });
}
function handleDetectedCodes(redeemedCodes, pendingCodes, detectedCodes) {
    var _a;
    if (!detectedCodes || detectedCodes.length == 0)
        return;
    if (!redeemedCodes)
        redeemedCodes = [];
    if (!pendingCodes)
        pendingCodes = [];
    var detectedCode;
    while (detectedCode = detectedCodes.pop()) {
        if (!redeemedCodes.includes(detectedCode) && !pendingCodes.includes(detectedCode)) {
            console.log("New code detected: " + detectedCode);
            pendingCodes.push(detectedCode);
        }
        else if (pendingCodes.includes(detectedCode)) {
            console.debug("Duplicate pending code: " + detectedCode);
        }
        else {
            console.debug("Duplicate redeemed code: " + detectedCode);
        }
    }
    if (pendingCodes.length > 0) {
        console.log("New codes detected, saving list.");
        console.debug(pendingCodes);
        chrome.storage.sync.set((_a = {}, _a[Globals.SETTING_CODES] = redeemedCodes, _a[Globals.SETTING_PENDING] = pendingCodes, _a), function () {
            startUploadProcess();
        });
    }
    else {
        console.log("No new codes detected.");
        chrome.runtime.sendMessage({ messageType: "info", messageText: "No new codes detected." });
    }
}
function startUploadProcess() {
    chrome.storage.sync.get([Globals.SETTING_CODES, Globals.SETTING_PENDING, Globals.SETTING_INSTANCE_ID, Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], function (_a) {
        var redeemedCodes = _a.redeemedCodes, pendingCodes = _a.pendingCodes, instanceId = _a.instanceId, userId = _a.userId, userHash = _a.userHash;
        console.log("Beginning upload.");
        uploadCodes(redeemedCodes, pendingCodes, instanceId, userId, userHash);
    });
}
function uploadCodes(reedemedCodes, pendingCodes, instanceId, userId, hash) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var server, duplicates, newCodes, expired, invalid, chests, code, codeResponse, userData;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!userId || userId.length == 0 || !hash || hash.length == 0) {
                        chrome.runtime.sendMessage({ messageType: "missingCredentials" });
                        console.error("No credentials entered.");
                        return [2];
                    }
                    return [4, IdleChampionsApi.getServer()];
                case 1:
                    server = _d.sent();
                    if (!server) {
                        console.error("Failed to get idle champions server.");
                        chrome.runtime.sendMessage({ messageType: "error", messageText: "Unable to connect to Idle Champions server." });
                        return [2];
                    }
                    console.log("Got server " + server);
                    chrome.runtime.sendMessage({ messageType: "info", messageText: "Upload starting, " + pendingCodes.length + " new codes to redeem. This may take a bit." });
                    duplicates = 0, newCodes = 0, expired = 0, invalid = 0;
                    chests = {};
                    _d.label = 2;
                case 2:
                    if (!(code = pendingCodes.pop())) return [3, 10];
                    return [4, new Promise(function (h) { return setTimeout(h, 5000); })];
                case 3:
                    _d.sent();
                    console.log("Attempting to upload code: " + code);
                    return [4, IdleChampionsApi.submitCode({
                            server: server,
                            user_id: userId,
                            hash: hash,
                            instanceId: instanceId,
                            code: code
                        })];
                case 4:
                    codeResponse = _d.sent();
                    if (!(codeResponse.status == CodeSubmitStatus.OutdatedInstanceId)) return [3, 9];
                    console.log("Instance ID outdated, refreshing.");
                    return [4, new Promise(function (h) { return setTimeout(h, 3000); })];
                case 5:
                    _d.sent();
                    return [4, IdleChampionsApi.getUserDetails({
                            server: server,
                            user_id: userId,
                            hash: hash
                        })];
                case 6:
                    userData = _d.sent();
                    if (!userData) {
                        console.log("Failed to retreive user data.");
                        chrome.runtime.sendMessage({ messageType: "error", messageText: "Failed to retreieve user data, check user ID and hash." });
                        return [2];
                    }
                    instanceId = userData.details.instance_id;
                    chrome.storage.sync.set((_b = {}, _b[Globals.SETTING_INSTANCE_ID] = instanceId, _b));
                    return [4, new Promise(function (h) { return setTimeout(h, 3000); })];
                case 7:
                    _d.sent();
                    return [4, IdleChampionsApi.submitCode({
                            server: server,
                            user_id: userId,
                            hash: hash,
                            instanceId: instanceId,
                            code: code
                        })];
                case 8:
                    codeResponse = _d.sent();
                    _d.label = 9;
                case 9:
                    switch (codeResponse.status) {
                        case CodeSubmitStatus.OutdatedInstanceId:
                        case CodeSubmitStatus.Failed:
                            console.error("Unable to submit code, aborting upload process.");
                            chrome.runtime.sendMessage({ messageType: "error", messageText: "Failed to submit code for unknown reason." });
                            return [2];
                        case CodeSubmitStatus.InvalidParameters:
                            console.error("Unable to submit code due to invalid parameters.");
                            chrome.runtime.sendMessage({ messageType: "error", messageText: "Failed to submit code, check user/hash on settings tab." });
                            return [2];
                        case CodeSubmitStatus.Expired:
                        case CodeSubmitStatus.NotValidCombo:
                        case CodeSubmitStatus.AlreadyRedeemed:
                        case CodeSubmitStatus.Success:
                            if (codeResponse.status == CodeSubmitStatus.AlreadyRedeemed) {
                                console.log("Already redeemed code: " + code);
                                duplicates++;
                            }
                            else if (codeResponse.status == CodeSubmitStatus.NotValidCombo) {
                                console.log("Invalid code: " + code);
                                invalid++;
                            }
                            else if (codeResponse.status == CodeSubmitStatus.Expired) {
                                console.log("Expired code: " + code);
                                expired++;
                            }
                            else {
                                console.log("Sucessfully redeemed: " + code);
                                if (codeResponse.chestType) {
                                    chests[codeResponse.chestType] = ((_a = chests[codeResponse.chestType]) !== null && _a !== void 0 ? _a : 0) + 1;
                                }
                                newCodes++;
                            }
                            reedemedCodes.push(code);
                            if (reedemedCodes.length > 300) {
                                reedemedCodes.shift();
                            }
                            chrome.storage.sync.set((_c = {}, _c[Globals.SETTING_CODES] = reedemedCodes, _c[Globals.SETTING_PENDING] = pendingCodes, _c));
                            break;
                    }
                    chrome.runtime.sendMessage({ messageType: "info", messageText: "Uploading... " + pendingCodes.length + " codes left. This may take a bit." });
                    return [3, 2];
                case 10:
                    console.log("Redeem complete:");
                    console.log(duplicates + " duplicate codes");
                    console.log(newCodes + " new redemptions");
                    console.log(expired + " expired");
                    console.log(invalid + " invalid");
                    console.log(chests);
                    chrome.runtime.sendMessage({
                        messageType: "success",
                        chests: chests,
                        messageText: "Upload completed successfully.<br>\n                        " + (duplicates > 0 ? duplicates + " codes already redeemed<br>" : "") + "\n                        " + (expired > 0 ? expired + " expired codes<br>" : "") + "\n                        " + (invalid > 0 ? invalid + " invalid codes<br>" : "") + "\n                        " + newCodes + " codes redeemed."
                    });
                    return [2];
            }
        });
    });
}