"use strict";

const bcrypt = require("bcrypt");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.hasOne(models.UserTokens, {
        as: "creator",
        foreignKey: "created_by",
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      });

      Users.hasOne(models.UserTokens, {
        as: "updater",
        foreignKey: "updated_by",
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      });
    }
  }
  Users.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      full_name: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      wrike_user_id: {
        type: DataTypes.STRING,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
      },
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Users",
      schema: "auth",
      underscored: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  Users.beforeCreate((data, options) => {
    try {
      if (data?.password) {
        data.password = bcrypt.hashSync(data.password, bcrypt.genSaltSync(10));
      }
      if (data?.email) {
        data.email = data?.email?.toLowerCase();
      }
    } catch (err) {
      console.log("Error while creating an user", err?.message || err);
    }
  });

  // Update Hook
  Users.beforeUpdate(async (data, options) => {
    try {
      data.updated_at = new Date();
    } catch (err) {
      console.log("Error while updating an user", err?.message || err);
    }
  });

  return Users;
};
