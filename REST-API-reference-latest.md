# 保险业务系统 REST API 参考文档 v1.0 <!-- omit in toc -->

[Postman](https://www.postman.com/itabbot/workspace/fooins/documentation/23043514-109c3eef-b80a-4455-80f8-c0f2f1f3bb29)

## 变更说明 <!-- omit in toc -->

本文档及对应的 API 是最初始版本。

## 目录 <!-- omit in toc -->

- [1. 接口规范](#1-接口规范)
  - [1.1. 接口地址](#11-接口地址)
  - [1.2. 数据格式](#12-数据格式)
  - [1.3. 错误响应](#13-错误响应)
  - [1.4. 身份验证](#14-身份验证)
  - [1.5. 其他细节](#15-其他细节)
- [2. 保单接口](#2-保单接口)
  - [2.1. 承保](#21-承保)
  - [2.2. 报价](#22-报价)
  - [2.3. 查询保单](#23-查询保单)
  - [2.4. 续保](#24-续保)
  - [2.5. 退保](#25-退保)
- [3. 批单接口](#3-批单接口)
  - [3.1. 批改](#31-批改)
- [4. 理赔接口](#4-理赔接口)
  - [4.1. 申请理赔](#41-申请理赔)
  - [4.2. 查询理赔单](#42-查询理赔单)
- [5. 其他接口](#5-其他接口)
  - [5.1. 消息订阅](#51-消息订阅)
- [6. 附录](#6-附录)

# 1. 接口规范

## 1.1. 接口地址

所有 API 都通过 HTTPS 来访问，并以下方地址作为接口的基础地址：

| 环境 | 地址                                       |
| ---- | ------------------------------------------ |
| 生产 | https://insbiz.fooins.itabbot.com/v1.0     |
| 开发 | https://dev.insbiz.fooins.itabbot.com/v1.0 |

## 1.2. 数据格式

对于 POST、PUT、PATH 和 DELETE 请求，所有数据均以 JSON 格式发送和接收。客户端需使用 `Content-type` 为 `application/json` 的 HTTP 请求标头。

## 1.3. 错误响应

对于请求不成功的情况，服务端会返回标准的 HTTP 状态代码和一个错误对象，以供客户端识别并与成功响应的情况分开处理。

对于允许重试的情况，服务端还会响应一个 `Retry-After` 的 HTTP 标头，指示客户端再次尝试之前应该等待的最小秒数。

### 1.3.1. HTTP 状态代码 <!-- omit in toc -->

| 状态代码 | 状态消息                                  | 说明                                                       |
| :------: | ----------------------------------------- | ---------------------------------------------------------- |
|   400    | 错误的请求 (Bad Request)                  | 无法处理请求，因为格式有误或者不正确。                     |
|   401    | 未经授权 (Unauthorized)                   | 资源所需的身份验证信息缺少或无效。                         |
|   403    | 禁止访问 (Forbidden)                      | 对于请求的资源，访问被拒绝。用户可能没有足够的权限。       |
|   404    | 未找到 (Not Found)                        | 所请求的资源不存在。                                       |
|   405    | 方法不允许 (Method Not Allowed)           | 请求中的 HTTP 方法在资源上不允许。                         |
|   406    | 不接受 (Not Acceptable)                   | 该服务不支持 “Accept” 标头中请求的格式。                   |
|   413    | 请求实体太大 (Request Entity Too Large)   | 请求的大小超出最大限制。                                   |
|   415    | 媒体类型不受支持 (Unsupported Media Type) | 请求的内容类型的格式不受服务支持。                         |
|   422    | 实体无法处理 (Unprocessable Entity)       | 无法处理请求，因为语义上不正确。                           |
|   429    | 请求过多 (Too Many Requests)              | 客户端应用程序已被限制，经过一段时间之后再尝试重复的请求。 |
|   500    | 内部服务器错误 (Internal Server Error)    | 处理请求时出现内部服务器错误。                             |
|   503    | 服务不可用 (Service Unavailable)          | 该服务暂时不可用。可以过段时间之后再重复该请求。           |

### 1.3.2. 错误对象 <!-- omit in toc -->

错误响应：

| 属性名  |           类型            | 必需 | 描述       |
| ------- | :-----------------------: | :--: | ---------- |
| `error` | [错误对象](#error-object) |  是  | 错误对象。 |

<p id="error-object">错误对象：</p>

| 属性名       |             类型              | 必需 | 描述                                                                                                                                   |
| ------------ | :---------------------------: | :--: | -------------------------------------------------------------------------------------------------------------------------------------- |
| `code`       |            字符串             |  是  | [错误代码](#133-错误代码-)中的一项。通常是人类可读的，指示出比 HTTP 状态码更加具体的错误。                                             |
| `message`    |            字符串             |  是  | 人类可读的错误消息。主要是为开发人员提供帮助，而不作为暴露给最终用户的提示语。                                                         |
| `target`     |            字符串             |  否  | 错误的目标。通常是某个属性名。                                                                                                         |
| `details`    | [错误对象](#error-object)数组 |  否  | 错误详细信息。通常表示某次错误请求发生的多个不同的错误。                                                                               |
| `innerError` | [内部错误对象](#inner-error)  |  否  | 包含更具体信息的系统内部错误对象。是一个嵌套的 InnerError 对象，反映出不同层级的错误细节。每个级别都可能包含服务端定义的一些特殊属性。 |

<p id="inner-error">内部错误对象：</p>

| 属性名       |             类型             | 必需 | 描述                   |
| ------------ | :--------------------------: | :--: | ---------------------- |
| `code`       |            字符串            |  是  | 更具体的错误代码。     |
| `innerError` | [内部错误对象](#inner-error) |  否  | 嵌套的 InnerError 对象 |

<details><summary>包含 innerError 的示例</summary>

```json
{
  "error": {
    "code": "BadArgument",
    "message": "Previous passwords may not be reused",
    "target": "password",
    "innerError": {
      "code": "PasswordError",
      "innerError": {
        "code": "PasswordDoesNotMeetPolicy",
        "minLength": "6",
        "maxLength": "64",
        "characterTypes": ["lowerCase", "upperCase", "number", "symbol"],
        "minDistinctCharacterTypes": "2",
        "innerError": {
          "code": "PasswordReuseNotAllowed"
        }
      }
    }
  }
}
```

</details>

<details><summary>包含 details 的示例</summary>

```json
{
  "error": {
    "code": "BadArgument",
    "message": "Multiple errors in ContactInfo data",
    "target": "ContactInfo",
    "details": [
      {
        "code": "NullValue",
        "target": "PhoneNumber",
        "message": "Phone number must not be null"
      },
      {
        "code": "NullValue",
        "target": "LastName",
        "message": "Last name must not be null"
      },
      {
        "code": "MalformedValue",
        "target": "Address",
        "message": "Address is not valid"
      }
    ]
  }
}
```

</details>

### 1.3.3. 错误代码 <!-- omit in toc -->

以下列出基本的错误代码，客户端应做好处理其中任意一项的准备。

| 错误代码            | 说明                                             |
| ------------------- | ------------------------------------------------ |
| Unauthorized        | 客户端未经授权。                                 |
| AccessDenied        | 客户端没有执行该操作的权限。                     |
| InvalidRequest      | 请求格式有误或不正确。                           |
| NotFound            | 所请求的资源不存在。                             |
| InternalServerError | 处理请求时出现服务端内部错误。                   |
| ServiceUnavailable  | 该服务暂时不可用。可以过段时间之后再重复该请求。 |
| GeneralException    | 发生未指定错误。                                 |

## 1.4. 身份验证

所有的 API 会对每个请求进行身份验证，客户端需要在 HTTP 请求标头中携带凭证以表明身份。格式如下：

```
Authorization: SecretId={密钥标识}, Timestamp={签名时间}, Signature={签名串}
```

请向管理员索要您的 SecretId 和 SecretKey，用于生成签名串（Signature）。生成方式为：

```
Signature = Base64( HMAC_SHA1( SecretKey, SecretId + Timestamp + Path + Query + Body ) )
```

<details><summary>点击查看示例</summary>

```
// 假设：
SecretId = "a867f464-55ea-4004-af53-0c8b025e7dc2"
SecretKey = "uKB^9C$@o6rbEDQKHHk01388lG@odVxJ"
Timestamp = "1659917288"
Path = "/v1.0/entities"
Query = "size=10&offset=0"
Body = ""

// 计算出的签名串为：
Signature = ""
```

</details>

其中：

- Base64：一种二进制数据编码方式，参阅 [RFC 4648](https://www.rfc-editor.org/rfc/rfc4648) 标准文件。
- HMAC_SHA1：一种加密算法，参阅 [RFC 2104](https://www.rfc-editor.org/rfc/rfc2104) 标准文件。
- SecretKey：由管理员分配的密钥，请妥善保管避免泄漏。
- SecretId：由管理员分配的密钥标识。
- Timestamp：发起请求之时的秒级时间戳。
- Path：请求路径。
- Query：对所有 HTTP Query 参数按参数名的字典序（ASCII 码）升序排序，然后使用 “=” 连接参数名和参数值，再使用 “&” 连接每个键值对得到 Query 串。若没有 HTTP Query 参数则使用空字符串。
- Body：最终用于发送到服务端的数据体，JSON 字符串格式。若没有则使用空字符串。
- +：这里的加号表示字符串连接。

## 1.5. 其他细节

服务端响应请求时，会将服务端生成的请求跟踪标识携带在 `X-INS-Trace-Id` 响应标头中，以便于跟踪排查问题。

空值的字段会使用 `null` 值，而不是被省略。

所有时间值都以 UTC 时间（ISO 8601）格式返回：`YYYY-MM-DDTHH:MM:SSZ`。

<p id="required">有些请求参数的必需性是取决于相关的配置，这种情况下，会使用 “?” 来标识该参数是否必须。</p>

# 2. 保单接口

## 2.1. 承保

请求方法：POST

请求路径：/policies

### 2.1.1. 请求参数 <!-- omit in toc -->

<details><summary>完整示例</summary>

```JSON
{
  "orderNo": "f8062bebe66f4729bd2d70f227e1222f",
  "contractCode": "C00001",
  "contractVersion": "1",
  "planCode": "PL0001",
  "effectiveTime": "2022-02-02T00:00:00Z",
  "expiryTime": "2022-02-22T23:59:59Z",
  "premium": 12.34,
  "extensions": {
    "trackingNo": "123456"
  },
  "applicants": [
    {
      "name": "张三",
      "idType": "idcard",
      "idNo": "110101190101016798",
      "gender": "man",
      "birth": "1901-01-01T00:00:00Z",
      "contactNo": "+8613000000000",
      "email": "8613000000000@qq.com"
    }
  ],
  "insureds": [
    {
      "relationship": "self",
      "name": "张三",
      "idType": "idcard",
      "idNo": "110101190101016798",
      "gender": "man",
      "birth": "1901-01-01T00:00:00Z",
      "contactNo": "+8613000000000",
      "email": "8613000000000@qq.com",
      "premium": 12.34
    }
  ]
}
```

</details>

请求参数：

| 序  | 参数名            | 类型                      |      必需      | 说明                                                                                             |
| :-: | ----------------- | ------------------------- | :------------: | ------------------------------------------------------------------------------------------------ |
|  1  | `orderNo`         | 字符串                    |       是       | 订单号。由销售渠道侧定义，长度在 64 个字符之内，仅支持字母、数字、下划线且需保证在渠道侧不重复。 |
|  2  | `contractCode`    | 字符串                    |       是       | 契约代码。指定所使用的契约。                                                                     |
|  3  | `contractVersion` | 字符串                    |       否       | 契约版本。不传默认使用最新版本。                                                                 |
|  4  | `planCode`        | 字符串                    |       是       | 计划代码。所选择的保险产品计划。                                                                 |
|  5  | `effectiveTime`   | UTC 时间                  | [?](#required) | 保单生效时间。                                                                                   |
|  6  | `expiryTime`      | UTC 时间                  | [?](#required) | 保单终止时间。                                                                                   |
|  7  | `premium`         | 浮点值                    | [?](#required) | 总保费。精确到两位小数。                                                                         |
|  8  | `extensions`      | 对象                      | [?](#required) | 附加信息。                                                                                       |
|  9  | `applicants`      | [投保人](#applicants)数组 | [?](#required) | 投保人。                                                                                         |
| 10  | `insureds`        | [被保险人](#insureds)数组 |       是       | 被保险人。                                                                                       |

<p id="applicants">投保人：</p>

| 序  | 参数名      | 类型                       |      必需      | 说明           |
| :-: | ----------- | -------------------------- | :------------: | -------------- |
|  1  | `name`      | 字符串                     | [?](#required) | 姓名。         |
|  2  | `idType`    | [证件类型](#证件类型枚举-) | [?](#required) | 证件类型。     |
|  3  | `idNo`      | 字符串                     | [?](#required) | 证件号码。     |
|  4  | `gender`    | [性别](#性别枚举-)         | [?](#required) | 性别。         |
|  5  | `birth`     | UTC 时间                   | [?](#required) | 出生日期。     |
|  6  | `contactNo` | 字符串                     | [?](#required) | 联系号码。     |
|  7  | `email`     | 字符串                     | [?](#required) | 电子邮箱地址。 |

<p id="insureds">被保险人：</p>

| 序  | 参数名         | 类型                               |      必需      | 说明                   |
| :-: | -------------- | ---------------------------------- | :------------: | ---------------------- |
|  1  | `relationship` | [与投保人关系](#与投保人关系枚举-) | [?](#required) | 与投保人关系。         |
|  2  | `name`         | 字符串                             | [?](#required) | 姓名。                 |
|  3  | `idType`       | [证件类型](#证件类型枚举-)         | [?](#required) | 证件类型。             |
|  4  | `idNo`         | 字符串                             | [?](#required) | 证件号码。             |
|  5  | `gender`       | [性别](#性别枚举-)                 | [?](#required) | 性别。                 |
|  6  | `birth`        | UTC 时间                           | [?](#required) | 出生日期。             |
|  7  | `contactNo`    | 字符串                             | [?](#required) | 联系号码。             |
|  8  | `email`        | 字符串                             | [?](#required) | 电子邮箱地址。         |
|  9  | `premium`      | 浮点值                             | [?](#required) | 保费。精确到两位小数。 |

### 2.1.2. 响应数据 <!-- omit in toc -->

<details><summary>完整示例</summary>

```JSON
{
  "orderNo": "f8062bebe66f4729bd2d70f227e1222f",
  "policyNo": "P000000000000000001",
  "contractCode": "C00001",
  "contractVersion": "1",
  "productCode": "P00001",
  "productVersion": "1",
  "planCode": "PL0001",
  "effectiveTime": "2022-02-02T00:00:00Z",
  "expiryTime": "2022-02-22T23:59:59Z",
  "boundTime": "2022-02-02T00:00:00Z",
  "premium": 12.34,
  "status": "valid",
  "extensions": {
    "trackingNo": "123456"
  },
  "applicants": [
    {
      "no": "f8062bebe66f",
      "name": "张三",
      "idType": "idcard",
      "idNo": "110101190101016798",
      "gender": "man",
      "birth": "1901-01-01T00:00:00Z",
      "contactNo": "+8613000000000",
      "email": "8613000000000@qq.com"
    }
  ],
  "insureds": [
    {
      "no": "s80w6d2bebes",
      "relationship": "self",
      "name": "张三",
      "idType": "idcard",
      "idNo": "110101190101016798",
      "gender": "man",
      "birth": "1901-01-01T00:00:00Z",
      "contactNo": "+8613000000000",
      "email": "8613000000000@qq.com",
      "premium": 12.34
    }
  ]
}
```

</details>

响应数据：

| 序  | 参数名            | 类型                          | 必需 | 说明           |
| :-: | ----------------- | ----------------------------- | :--: | -------------- |
|  1  | `orderNo`         | 字符串                        |  是  | 订单号。       |
|  2  | `policyNo`        | 字符串                        |  是  | 保单号。       |
|  3  | `contractCode`    | 字符串                        |  是  | 契约代码。     |
|  4  | `contractVersion` | 字符串                        |  是  | 契约版本。     |
|  5  | `productCode`     | 字符串                        |  是  | 产品代码。     |
|  7  | `productVersion`  | 字符串                        |  是  | 产品版本。     |
|  8  | `planCode`        | 字符串                        |  是  | 计划代码。     |
|  9  | `effectiveTime`   | UTC 时间                      |  是  | 保单生效时间。 |
| 10  | `expiryTime`      | UTC 时间                      |  是  | 保单终止时间。 |
| 11  | `boundTime`       | UTC 时间                      |  是  | 承保时间。     |
| 12  | `premium`         | 浮点值                        |  是  | 总保费。       |
| 12  | `status`          | [保单状态](#保单状态枚举-)    |  是  | 总保费。       |
| 13  | `extensions`      | 对象                          |  是  | 附加信息。     |
| 14  | `applicants`      | [投保人](#res-applicants)数组 |  是  | 投保人。       |
| 15  | `insureds`        | [被保险人](#res-insureds)数组 |  是  | 被保险人。     |

<p id="res-applicants">投保人：</p>

| 序  | 参数名      | 类型                       |      必需      | 说明                   |
| :-: | ----------- | -------------------------- | :------------: | ---------------------- |
|  1  | `no`        | 字符串                     |       是       | 编号。批改时需要用到。 |
|  2  | `name`      | 字符串                     | [?](#required) | 姓名。                 |
|  3  | `idType`    | [证件类型](#证件类型枚举-) | [?](#required) | 证件类型。             |
|  4  | `idNo`      | 字符串                     | [?](#required) | 证件号码。             |
|  5  | `gender`    | [性别](#性别枚举-)         | [?](#required) | 性别。                 |
|  6  | `birth`     | UTC 时间                   | [?](#required) | 出生日期。             |
|  7  | `contactNo` | 字符串                     | [?](#required) | 联系号码。             |
|  8  | `email`     | 字符串                     | [?](#required) | 电子邮箱地址。         |

<p id="res-insureds">被保险人：</p>

| 序  | 参数名         | 类型                               |      必需      | 说明                   |
| :-: | -------------- | ---------------------------------- | :------------: | ---------------------- |
|  1  | `no`           | 字符串                             |       是       | 编号。批改时需要用到。 |
|  2  | `relationship` | [与投保人关系](#与投保人关系枚举-) | [?](#required) | 与投保人关系。         |
|  3  | `name`         | 字符串                             | [?](#required) | 姓名。                 |
|  4  | `idType`       | [证件类型](#证件类型枚举-)         | [?](#required) | 证件类型。             |
|  5  | `idNo`         | 字符串                             | [?](#required) | 证件号码。             |
|  6  | `gender`       | [性别](#性别枚举-)                 | [?](#required) | 性别。                 |
|  7  | `birth`        | UTC 时间                           | [?](#required) | 出生日期。             |
|  8  | `contactNo`    | 字符串                             | [?](#required) | 联系号码。             |
|  9  | `email`        | 字符串                             | [?](#required) | 电子邮箱地址。         |
| 10  | `premium`      | 浮点值                             | [?](#required) | 保费。精确到两位小数。 |

## 2.2. 报价

请求方法：POST

请求路径：/policies/quote

请求参数：同[承保请求参数](#211-请求参数-)。

<details><summary>响应数据完整示例</summary>

```JSON
{
  "contractCode": "C00001",
  "contractVersion": "1",
  "productCode": "P00001",
  "productVersion": "1",
  "planCode": "PL0001",
  "effectiveTime": "2022-02-02T00:00:00Z",
  "expiryTime": "2022-02-22T23:59:59Z",
  "premium": 12.34,
  "insureds": [
    {
      "relationship": "self",
      "name": "张三",
      "idType": "idcard",
      "idNo": "110101190101016798",
      "gender": "man",
      "birth": "1901-01-01T00:00:00Z",
      "contactNo": "+8613000000000",
      "email": "8613000000000@qq.com",
      "premium": 12.34
    }
  ]
}
```

</details>

响应数据：

| 序  | 参数名            | 类型                                  | 必需 | 说明                                   |
| :-: | ----------------- | ------------------------------------- | :--: | -------------------------------------- |
|  1  | `contractCode`    | 字符串                                |  是  | 契约代码。                             |
|  2  | `contractVersion` | 字符串                                |  是  | 契约版本。                             |
|  3  | `productCode`     | 字符串                                |  是  | 产品代码。                             |
|  4  | `productVersion`  | 字符串                                |  是  | 产品版本。                             |
|  5  | `planCode`        | 字符串                                |  是  | 计划代码。                             |
|  6  | `effectiveTime`   | UTC 时间                              |  是  | 保单生效时间。                         |
|  7  | `expiryTime`      | UTC 时间                              |  是  | 保单终止时间。                         |
|  8  | `premium`         | 浮点值                                |  是  | 总保费。                               |
|  9  | `insureds`        | [响应的被保险人](#quote-insureds)数组 |  是  | 被保险人清单，包含每个被保险人的保费。 |

<p id="quote-insureds">响应的被保险人：</p>

| 序  | 参数名         | 类型                               |      必需      | 说明                   |
| :-: | -------------- | ---------------------------------- | :------------: | ---------------------- |
|  1  | `relationship` | [与投保人关系](#与投保人关系枚举-) | [?](#required) | 与投保人关系。         |
|  2  | `name`         | 字符串                             | [?](#required) | 姓名。                 |
|  3  | `idType`       | [证件类型](#证件类型枚举-)         | [?](#required) | 证件类型。             |
|  4  | `idNo`         | 字符串                             | [?](#required) | 证件号码。             |
|  5  | `gender`       | [性别](#性别枚举-)                 | [?](#required) | 性别。                 |
|  6  | `birth`        | UTC 时间                           | [?](#required) | 出生日期。             |
|  7  | `contactNo`    | 字符串                             | [?](#required) | 联系号码。             |
|  8  | `email`        | 字符串                             | [?](#required) | 电子邮箱地址。         |
|  9  | `premium`      | 浮点值                             |       是       | 保费。精确到两位小数。 |

## 2.3. 查询保单

请求方法：GET

请求路径：/policies/{policyNo}

路径参数：

| 序  | 参数名     | 类型   | 必需 | 说明     |
| :-: | ---------- | ------ | :--: | -------- |
|  1  | `policyNo` | 字符串 |  是  | 保单号。 |

路径示例：

```
/policies/P0000000001
```

响应数据：同[承保响应数据](#212-响应数据-)。

## 2.4. 续保

请求方法：POST

请求路径：/policies/renew

请求参数：

| 序  | 参数名     | 类型   | 必需 | 说明     |
| :-: | ---------- | ------ | :--: | -------- |
|  1  | `policyNo` | 字符串 |  是  | 保单号。 |

请求参数示例：

```JSON
{
  "policyNo": "P000000000001"
}
```

响应数据：同[承保响应数据](#212-响应数据-)。

## 2.5. 退保

请求方法：DELETE

请求路径：/policies/{policyNo}

路径参数：

| 序  | 参数名     | 类型   | 必需 | 说明     |
| :-: | ---------- | ------ | :--: | -------- |
|  1  | `policyNo` | 字符串 |  是  | 保单号。 |

路径示例：

```
/policies/P00000000001
```

响应数据：

| 序  | 参数名       | 类型   | 必需 | 说明                                       |
| :-: | ------------ | ------ | :--: | ------------------------------------------ |
|  1  | `policyNo`   | 字符串 |  是  | 保单号。                                   |
|  2  | `endorseNo`  | 字符串 |  是  | 批单号。                                   |
|  3  | `difference` | 浮点值 |  是  | 保费变化差额（一般是负数，表示退费金额）。 |

完整示例：

```JSON
{
  "policyNo": "P000000000000000001",
  "endorseNo": "001",
  "difference": -12.34
}
```

# 3. 批单接口

## 3.1. 批改

请求方法：POST

请求路径：/endorsements

### 3.1.1. 请求参数 <!-- omit in toc -->

<details><summary>完整示例</summary>

```JSON
{
  "policyNo": "P000000000000000001",
  "planCode": "PL0001",
  "effectiveTime": "2022-02-02T00:00:00Z",
  "expiryTime": "2022-02-22T23:59:59Z",
  "applicants": [
    {
      "no": "f8062bebe66f",
      "name": "张三",
      "idType": "idcard",
      "idNo": "110101190101016798",
      "gender": "man",
      "birth": "1901-01-01T00:00:00Z",
      "contactNo": "+8613000000000",
      "email": "8613000000000@qq.com"
    }
  ],
  "insureds": [
    {
      "no": "s80w6d2bebes",
      "relationship": "self",
      "name": "张三",
      "idType": "idcard",
      "idNo": "110101190101016798",
      "gender": "man",
      "birth": "1901-01-01T00:00:00Z",
      "contactNo": "+8613000000000",
      "email": "8613000000000@qq.com"
    }
  ]
}
```

</details>

请求参数：

| 序  | 参数名          | 类型                              | 必需 | 说明           |
| :-: | --------------- | --------------------------------- | :--: | -------------- |
|  1  | `policyNo`      | 字符串                            |  是  | 保单号。       |
|  2  | `planCode`      | 字符串                            |  否  | 计划代码。     |
|  3  | `effectiveTime` | UTC 时间                          |  否  | 保单生效时间。 |
|  4  | `expiryTime`    | UTC 时间                          |  否  | 保单终止时间。 |
|  5  | `applicants`    | [投保人](#endorse-applicants)数组 |  否  | 投保人。       |
|  6  | `insureds`      | [被保险人](#endorse-insureds)数组 |  否  | 被保险人。     |

<p id="endorse-applicants">投保人：</p>

| 序  | 参数名      | 类型                       | 必需 | 说明           |
| :-: | ----------- | -------------------------- | :--: | -------------- |
|  1  | `no`        | 字符串                     |  是  | 编号。         |
|  2  | `name`      | 字符串                     |  否  | 姓名。         |
|  3  | `idType`    | [证件类型](#证件类型枚举-) |  否  | 证件类型。     |
|  4  | `idNo`      | 字符串                     |  否  | 证件号码。     |
|  5  | `gender`    | [性别](#性别枚举-)         |  否  | 性别。         |
|  6  | `birth`     | UTC 时间                   |  否  | 出生日期。     |
|  7  | `contactNo` | 字符串                     |  否  | 联系号码。     |
|  8  | `email`     | 字符串                     |  否  | 电子邮箱地址。 |

<p id="endorse-insureds">被保险人：</p>

| 序  | 参数名         | 类型                               | 必需 | 说明           |
| :-: | -------------- | ---------------------------------- | :--: | -------------- |
|  1  | `no`           | 字符串                             |  是  | 编号。         |
|  2  | `relationship` | [与投保人关系](#与投保人关系枚举-) |  否  | 与投保人关系。 |
|  3  | `name`         | 字符串                             |  否  | 姓名。         |
|  4  | `idType`       | [证件类型](#证件类型枚举-)         |  否  | 证件类型。     |
|  5  | `idNo`         | 字符串                             |  否  | 证件号码。     |
|  6  | `gender`       | [性别](#性别枚举-)                 |  否  | 性别。         |
|  7  | `birth`        | UTC 时间                           |  否  | 出生日期。     |
|  8  | `contactNo`    | 字符串                             |  否  | 联系号码。     |
|  9  | `email`        | 字符串                             |  否  | 电子邮箱地址。 |

### 3.1.2. 响应数据 <!-- omit in toc -->

<details><summary>完整示例</summary>

```JSON
{
  "policyNo": "P000000000000000001",
  "endorseNo": "001",
  "difference": -12.34,
  "details": [
    {
      "type": "insured",
      "field": "name",
      "original": "张三",
      "current": "李四",
      "targetNo": "s80w6d2bebes"
    }
  ]
}
```

</details>

响应数据：

| 序  | 参数名       | 类型                             | 必需 | 说明           |
| :-: | ------------ | -------------------------------- | :--: | -------------- |
|  1  | `policyNo`   | 字符串                           |  是  | 保单号。       |
|  2  | `endorseNo`  | 字符串                           |  是  | 批单号。       |
|  3  | `difference` | 浮点值                           |  是  | 保费变化差额。 |
|  4  | `details`    | [批改详情](#endorse-details)数组 |  是  | 批改详情。     |

<p id="endorse-details">批改详情：</p>

| 序  | 参数名     | 类型                       | 必需 | 说明                                 |
| :-: | ---------- | -------------------------- | :--: | ------------------------------------ |
|  1  | `type`     | [批改类型](#批改类型枚举-) |  是  | 批改类型。                           |
|  2  | `field`    | 字符串                     |  是  | 批改的字段名。                       |
|  3  | `original` | 字符串                     |  是  | 原值（批改前）。                     |
|  4  | `current`  | 字符串                     |  是  | 当前值（批改后）。                   |
|  5  | `targetNo` | 字符串                     |  否  | 批改目标编号。投保人或被保险人编号。 |

# 4. 理赔接口

## 4.1. 申请理赔

请求方法：POST

请求路径：/claims

### 4.1.1. 请求参数 <!-- omit in toc -->

<details><summary>完整示例</summary>

```JSON
{
  "policyNo": "P000000000001",
  "insureds": [
    {
      "relationship": "self",
      "name": "张三",
      "idType": "idcard",
      "idNo": "110101190101016798",
      "gender": "man",
      "birth": "1901-01-01T00:00:00Z"
    }
  ]
}
```

</details>

请求参数：

| 序  | 参数名     | 类型                            |      必需      | 说明               |
| :-: | ---------- | ------------------------------- | :------------: | ------------------ |
|  1  | `policyNo` | 字符串                          |       是       | 保单号。           |
|  2  | `insureds` | [被保险人](#claim-insureds)数组 | [?](#required) | 需理赔的被保险人。 |

<p id="claim-insureds">被保险人：</p>

| 序  | 参数名         | 类型                               |      必需      | 说明           |
| :-: | -------------- | ---------------------------------- | :------------: | -------------- |
|  1  | `no`           | 字符串                             | [?](#required) | 编号。         |
|  2  | `relationship` | [与投保人关系](#与投保人关系枚举-) | [?](#required) | 与投保人关系。 |
|  3  | `name`         | 字符串                             | [?](#required) | 姓名。         |
|  4  | `idType`       | [证件类型](#证件类型枚举-)         | [?](#required) | 证件类型。     |
|  5  | `idNo`         | 字符串                             | [?](#required) | 证件号码。     |
|  6  | `gender`       | [性别](#性别枚举-)                 | [?](#required) | 性别。         |
|  7  | `birth`        | UTC 时间                           | [?](#required) | 出生日期。     |

### 4.1.2. 响应数据 <!-- omit in toc -->

<details><summary>完整示例</summary>

```JSON
{
  "claimNo": "C000000000001",
  "policyNo": "P000000000001",
  "status": "pending",
  "insureds": [
    {
      "no": "s80w6d2bebes",
      "relationship": "self",
      "name": "张三",
      "idType": "idcard",
      "idNo": "110101190101016798",
      "gender": "man",
      "birth": "1901-01-01T00:00:00Z",
      "contactNo": "+8613000000000",
      "email": "8613000000000@qq.com",
      "premium": 12.34
    }
  ]
}
```

</details>

响应数据：

| 序  | 参数名     | 类型                                | 必需 | 说明               |
| :-: | ---------- | ----------------------------------- | :--: | ------------------ |
|  1  | `claimNo`  | 字符串                              |  是  | 理赔单号。         |
|  2  | `policyNo` | 字符串                              |  是  | 保单号。           |
|  3  | `status`   | [理赔状态](#理赔状态枚举-)          |  是  | 理赔单状态。       |
|  4  | `insureds` | [被保险人](#claim-res-insureds)数组 |  是  | 需理赔的被保险人。 |

<p id="claim-res-insureds">被保险人：</p>

| 序  | 参数名         | 类型                               |      必需      | 说明                   |
| :-: | -------------- | ---------------------------------- | :------------: | ---------------------- |
|  1  | `no`           | 字符串                             |       是       | 编号。                 |
|  2  | `relationship` | [与投保人关系](#与投保人关系枚举-) | [?](#required) | 与投保人关系。         |
|  3  | `name`         | 字符串                             | [?](#required) | 姓名。                 |
|  4  | `idType`       | [证件类型](#证件类型枚举-)         | [?](#required) | 证件类型。             |
|  5  | `idNo`         | 字符串                             | [?](#required) | 证件号码。             |
|  6  | `gender`       | [性别](#性别枚举-)                 | [?](#required) | 性别。                 |
|  7  | `birth`        | UTC 时间                           | [?](#required) | 出生日期。             |
|  8  | `contactNo`    | 字符串                             | [?](#required) | 联系号码。             |
|  9  | `email`        | 字符串                             | [?](#required) | 电子邮箱地址。         |
| 10  | `premium`      | 浮点值                             | [?](#required) | 保费。精确到两位小数。 |

## 4.2. 查询理赔单

请求方法：GET

请求路径：/claims/{claimNo}

路径参数：

| 序  | 参数名    | 类型   | 必需 | 说明       |
| :-: | --------- | ------ | :--: | ---------- |
|  1  | `claimNo` | 字符串 |  是  | 理赔单号。 |

路径示例：

```
/claims/C0000000001
```

响应数据：同[申请理赔响应数据](#412-响应数据-)。

# 5. 其他接口

## 5.1. 消息订阅

在某些场景下，客户端需要异步接收服务端的消息通知，可以通过消息订阅功能来实现。您需要向管理员提交接收消息通知的接口地址，并指定需要开通哪些类型的消息通知。目前支持的 [消息类型>>](#消息通知类型枚举-)。

通知方法：POST

认证方式：使用和客户端相同的[身份验证](#14-身份验证)方法。

### 5.1.1. 请求参数 <!-- omit in toc -->

请求参数：

| 序  | 参数名    | 类型                           | 必需 | 说明       |
| :-: | --------- | ------------------------------ | :--: | ---------- |
|  1  | `type`    | [消息类型](#消息通知类型枚举-) |  是  | 消息类型。 |
|  2  | `content` | 以下之一                       |  是  | 消息内容。 |

消息类型为 “理赔状态变更” 的消息内容：

| 序  | 参数名     | 类型                       | 必需 | 说明         |
| :-: | ---------- | -------------------------- | :--: | ------------ |
|  1  | `claimNo`  | 字符串                     |  是  | 理赔单号。   |
|  2  | `policyNo` | 字符串                     |  是  | 保单号。     |
|  3  | `status`   | [理赔状态](#理赔状态枚举-) |  是  | 理赔单状态。 |

<details><summary>消息类型为 “理赔状态变更” 的消息内容示例</summary>

```JSON
{
  "type": "ClaimStatusChange",
  "content": {
    "claimNo": "C00000000001",
    "policyNo": "P000000000000001",
    "status": "confirmed"
  }
}
```

</details>

### 5.1.2. 客户端响应 <!-- omit in toc -->

系统向客户端发起消息通知时，客户端接收成功后应响应 HTTP 状态码 `200`，否则系统将认为通知失败。

**重试机制**：通知失败时，系统会通过一定的策略定期重新发起通知，尽可能提高通知的成功率，但不保证通知最终能成功。通知频率为 15s/30s/3m/10m/20m/30m/60m/3h/6h/24h。

**处理重复**：同样的通知可能会多次发送给客户端系统，客户端系统必须能够正确处理重复的通知，以避免造成数据混乱。

**主动查询**：在必要之时，客户端系统应调用相关查询接口确认业务状态。

# 6. 附录

## 证件类型枚举 <!-- omit in toc -->

| 序  | 枚举值   | 说明     |
| :-: | -------- | -------- |
|  1  | idcard   | 身份证。 |
|  2  | passport | 护照。   |

## 性别枚举 <!-- omit in toc -->

| 序  | 枚举值  | 说明   |
| :-: | ------- | ------ |
|  1  | man     | 男。   |
|  2  | female  | 女。   |
|  3  | other   | 其他。 |
|  4  | unknown | 未知。 |

## 与投保人关系枚举 <!-- omit in toc -->

| 序  | 枚举值   | 说明   |
| :-: | -------- | ------ |
|  1  | self     | 自己。 |
|  2  | parents  | 父母。 |
|  3  | brothers | 兄弟。 |
|  4  | sisters  | 姐妹。 |

## 理赔状态枚举 <!-- omit in toc -->

| 序  | 枚举值    | 说明       |
| :-: | --------- | ---------- |
|  1  | pending   | 待处理。   |
|  2  | handing   | 受理中。   |
|  3  | declined  | 拒绝理赔。 |
|  4  | confirmed | 理赔成功。 |

## 消息通知类型枚举 <!-- omit in toc -->

| 序  | 枚举值            | 说明           |
| :-: | ----------------- | -------------- |
|  1  | ClaimStatusChange | 理赔状态变更。 |

## 批改类型枚举 <!-- omit in toc -->

| 序  | 枚举值    | 说明           |
| :-: | --------- | -------------- |
|  1  | policy    | 批改保单信息。 |
|  2  | applicant | 批改投保人。   |
|  3  | insured   | 批改被保险人。 |

## 保单状态枚举 <!-- omit in toc -->

| 序  | 枚举值   | 说明     |
| :-: | -------- | -------- |
|  1  | valid    | 有效。   |
|  2  | canceled | 已退保。 |
