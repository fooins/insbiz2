const {
  getPolicyModel,
  getContractModel,
  getProductModel,
  getPlanModel,
  getApplicantModel,
  getInsuredModel,
  getEndorsementModel,
  getEndorsementDetailModel,
  getPolicySnapshootModel,
} = require('../../models');
const { error500 } = require('../../libraries/utils');
const { getDbConnection } = require('../../libraries/data-access');

/**
 * 通过保单号获取保单信息
 * @param {string} policyNo 保单号
 * @param {object} options 选项
 * @returns {object} 保单信息
 */
const getPolicyByNo = async (policyNo, options = {}) => {
  const Policy = getPolicyModel();
  const params = {
    where: { policyNo },
    include: [],
  };
  if (options.attributes) params.attributes = options.attributes;

  // 查询授权
  if (options.includeContract) {
    const Contract = getContractModel();
    Policy.belongsTo(Contract);

    const include = {
      model: Contract,
    };
    if (options.includeContract.attributes) {
      include.attributes = options.includeContract.attributes;
    }

    params.include.push(include);
  }

  // 查询产品
  if (options.includeProduct) {
    const Product = getProductModel();
    Policy.belongsTo(Product);

    const include = {
      model: Product,
    };
    if (options.includeProduct.attributes) {
      include.attributes = options.includeProduct.attributes;
    }

    params.include.push(include);
  }

  // 查询计划
  if (options.includePlan) {
    const Plan = getPlanModel();
    Policy.belongsTo(Plan);

    const include = {
      model: Plan,
    };
    if (options.includePlan.attributes) {
      include.attributes = options.includePlan.attributes;
    }

    params.include.push(include);
  }

  // 查询保单
  const policy = await Policy.findOne(params);
  if (!policy) return policy;

  // 解析业务配置信息
  if (options.parseBizConfig && policy.bizConfig) {
    try {
      policy.bizConfigParsed = JSON.parse(policy.bizConfig);
    } catch (error) {
      throw error500('保单数据有误(bizConfig)', { cause: error });
    }
  }

  // 查询投保人
  if (options.queryApplicants) {
    policy.applicants = await getApplicantModel().findAll({
      where: { policyId: policy.id },
    });
  }

  // 查询被保险人
  if (options.queryInsureds) {
    policy.insureds = await getInsuredModel().findAll({
      where: { policyId: policy.id },
    });
  }

  return policy;
};

/**
 * 通过计划代码获取计划信息
 * @param {string} code 计划代码
 * @param {number} version 计划版本号（同产品版本号）
 * @returns {object} 计划信息
 */
const getPlanByCode = (code, version) =>
  getPlanModel().findOne({
    where: { code, version },
  });

/**
 * 保存批单
 * @param {object} saveData 需要保存的数据
 */
const saveEndorsement = async (saveData) => {
  // 创建事务
  const t = await getDbConnection().transaction();

  try {
    const { endorsementData, newPolicyData, policySnapshootData } = saveData;
    const { applicants, insureds } = newPolicyData;

    // 生成批单
    const endorsement = await getEndorsementModel().create(endorsementData, {
      transaction: t,
    });

    // 生成批单详情
    const endorseDetails = await getEndorsementDetailModel().bulkCreate(
      endorsementData.details.map((detail) => ({
        ...detail,
        endorsementId: endorsement.id,
      })),
      { transaction: t },
    );

    // 生成保单快照
    const policySnapshoot = await getPolicySnapshootModel().create(
      {
        ...policySnapshootData,
        endorsementId: endorsement.id,
      },
      { transaction: t },
    );

    // 更新保单
    await getPolicyModel().update(newPolicyData, {
      transaction: t,
      where: { id: endorsement.policyId },
    });

    // 更新投保人
    if (applicants.length > 0) {
      for (let i = 0; i < applicants.length; i += 1) {
        const applicant = applicants[i];

        // eslint-disable-next-line no-await-in-loop
        await getApplicantModel().update(applicant, {
          transaction: t,
          where: { no: applicant.no, policyId: endorsementData.policyId },
        });
      }
    }

    // 更新被保险人
    if (insureds.length > 0) {
      for (let i = 0; i < insureds.length; i += 1) {
        const insured = insureds[i];

        // eslint-disable-next-line no-await-in-loop
        await getInsuredModel().update(insured, {
          transaction: t,
          where: { no: insured.no, policyId: endorsementData.policyId },
        });
      }
    }

    // 提交事务
    await t.commit();

    return {
      endorsement,
      endorseDetails,
      policySnapshoot,
    };
  } catch (error) {
    // 回滚事务
    await t.rollback();

    // 抛出错误
    throw error;
  }
};

module.exports = {
  getPolicyByNo,
  getPlanByCode,
  saveEndorsement,
};
