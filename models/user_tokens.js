"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserTokens extends Model {
    static associate(models) {
      UserTokens.belongsTo(models.Users, {
        as: "creator",
        foreignKey: "created_by",
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      });
      UserTokens.belongsTo(models.Users, {
        as: "updater",
        foreignKey: "updated_by",
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      });
      UserTokens.belongsTo(models.Users, {
        as: "deleter",
        foreignKey: "deleted_by",
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      });
    }
  }

  UserTokens.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      encrypted_access_token: {
        type: DataTypes.TEXT,
      },
      encrypted_refresh_token: {
        type: DataTypes.TEXT,
      },
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
        type: DataTypes.DATE,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "UserTokens",
      tableName: "user_tokens",
      underscored: true,
      createdAt: false,
      updatedAt: false,
    }
  );

  UserTokens.beforeCreate((data, options) => {
    try {
      data.created_at = new Date();
      data.created_by = options?.user_id;
    } catch (err) {
      console.log("Error while creating a user token", err?.message || err);
    }
  });

  // Update Hook
  UserTokens.beforeUpdate(async (data, options) => {
    try {
      data.updated_at = new Date();
      data.updated_by = options?.user_id;
    } catch (err) {
      console.log("Error while updating a user token", err?.message || err);
    }
  });

  // Delete Hook
  UserTokens.afterDestroy(async (data, options) => {
    try {
      // data.deleted_by = options?.user_id;
      data.is_active = false;

      await data.save({ profile_id: options.profile_id });
    } catch (err) {
      console.log("Error while deleting a user token", err?.message || err);
    }
  });

  return UserTokens;
};
