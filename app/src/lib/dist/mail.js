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
exports.__esModule = true;
exports.verifyOtp = exports.saveOtpInRedis = exports.optGenerator = exports.sendOtpMail = void 0;
var bcrypt_1 = require("bcrypt");
var fs_1 = require("fs");
var handlebars_1 = require("handlebars");
var nodemailer_1 = require("nodemailer");
var path_1 = require("path");
var redis_1 = require("../lib/redis");
// const transporter = nodemailer.createTransport({
//   host: "smtp.sendgrid.net",
//   port: 587,
//   auth: {
//     user: "apikey",
//     pass: process.env.SENDGRID_API_KEY,
//   },
// });
var transporter = nodemailer_1["default"].createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
exports.sendOtpMail = function (_a) {
    var email = _a.email, otp = _a.otp;
    return __awaiter(void 0, void 0, void 0, function () {
        var filePath, source, template, html, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    filePath = path_1["default"].join(process.cwd(), 'app/src/templates/otp.hbs');
                    source = fs_1.readFileSync(filePath, "utf-8");
                    template = handlebars_1["default"].compile(source);
                    html = template({ otp: otp });
                    return [4 /*yield*/, transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: email,
                            subject: 'DevFlow - Verification Otp',
                            html: html
                        })];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    console.log('fail to send opt', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.optGenerator = function () {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
// opt save in redis for 5 minutes
exports.saveOtpInRedis = function (email, otp) { return __awaiter(void 0, void 0, void 0, function () {
    var hashedOtp;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bcrypt_1["default"].hash(otp, 10)];
            case 1:
                hashedOtp = _a.sent();
                return [4 /*yield*/, redis_1.redis.set("signup-otp:" + email, hashedOtp, { ex: 120 })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.verifyOtp = function (email, otp) { return __awaiter(void 0, void 0, void 0, function () {
    var storedOtp, isValid;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!otp)
                    return [2 /*return*/, false];
                return [4 /*yield*/, redis_1.redis.get("signup-otp:" + email)];
            case 1:
                storedOtp = _a.sent();
                if (!storedOtp || typeof storedOtp !== "string") {
                    return [2 /*return*/, false];
                }
                return [4 /*yield*/, bcrypt_1["default"].compare(otp, storedOtp)];
            case 2:
                isValid = _a.sent();
                if (!isValid)
                    return [2 /*return*/, false];
                return [4 /*yield*/, redis_1.redis.del("signup-otp:" + email)];
            case 3:
                _a.sent();
                return [2 /*return*/, true];
        }
    });
}); };
