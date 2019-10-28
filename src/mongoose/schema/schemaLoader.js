import mongoose from 'mongoose';
import fieldToSchemaMap from './fieldToSchemaMap';
import localizationPlugin from '../../localization/localization.plugin';
import autopopulate from '../autopopulate.plugin';
import validateCollection from '../../utilities/validateCollection';
import {schemaBaseFields} from './schemaBaseFields';
import passwordResetConfig from '../../auth/passwordResets/passwordReset.config';
import paginate from '../paginate.plugin';
import buildQueryPlugin from '../buildQuery.plugin';
import validateGlobal from '../../utilities/validateGlobal';

class SchemaLoader {

  blockSchema;
  contentBlocks = {};
  collections = {};
  globals = {};
  globalModel = {};

  /**
   * Sets up schema and models using payload config
   * @param config
   * @param config.collections
   * @param config.globals
   * @param config.contentBlocks
   */
  constructor(config) {
    this.blockSchema = new mongoose.Schema({},
      {discriminatorKey: 'blockType', _id: false});
this.blockSchema.plugin(autopopulate);
    this.blockSchemaLoader(config);
    this.collectionSchemaLoader(config);
    this.globalSchemaLoader(config);
  }

  blockSchemaLoader = config => {
    Object.values(config.contentBlocks).forEach(blockConfig => {
      // TODO: any kind of validation for blocks?
      const fields = {};

      const flexibleSchema = {};
      blockConfig.fields.forEach(field => {
        const fieldSchema = fieldToSchemaMap[field.type];
        if (fieldSchema) fields[field.name] = fieldSchema(field, this.blockSchema);
        if (field.type === 'flexible') {
          flexibleSchema[field.name] = field;
        }
      });
      // TODO: instead of making the model with all the fields, create a separate model
      // replace block schema with a ref to the new model type

      const Schema = new mongoose.Schema(fields)
        .plugin(paginate)
        .plugin(buildQueryPlugin)
        // .plugin(localizationPlugin, config.localization)
        .plugin(autopopulate);

      const Model = mongoose.model(blockConfig.slug, Schema);

      const RefSchema = new mongoose.Schema(
        {
          relation: {
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
            ref: blockConfig.slug,
          }
        }
      );
      RefSchema.plugin(autopopulate);

      Object.values(flexibleSchema).forEach(flexible => {
        flexible.blocks.forEach(blockType => {
          Schema
            .path(flexible.name)
            .discriminator(blockType, RefSchema)
        });
      });

      this.contentBlocks[blockConfig.slug] = {
        config: blockConfig,
        schema: Schema,
        refSchema: RefSchema,
        model: Model
      };
    });
  };

  collectionSchemaLoader = config => {
    Object.values(config.collections).forEach(collectionConfig => {

      validateCollection(collectionConfig, this.collections);
      this.collections[collectionConfig.labels.singular] = collectionConfig;
      const fields = {...schemaBaseFields};

      // authentication
      if (config.auth && config.auth.passwordResets) {
        config.fields.push(...passwordResetConfig.fields);
      }

      const flexibleSchema = {};
      collectionConfig.fields.forEach(field => {
        const fieldSchema = fieldToSchemaMap[field.type];
        if (fieldSchema) fields[field.name] = fieldSchema(field, this.blockSchema);
        if (field.type === 'flexible') {
          flexibleSchema[field.name] = field;
        }
      });

      const Schema = new mongoose.Schema(fields, {timestamps: collectionConfig.timestamps});

      Schema.plugin(paginate);
      Schema.plugin(buildQueryPlugin);
      Schema.plugin(localizationPlugin, config.localization);
      Schema.plugin(autopopulate);

      Object.values(flexibleSchema).forEach(flexible => {
        flexible.blocks.forEach(blockType => {
          Schema.path(flexible.name)
            .discriminator(blockType, this.contentBlocks[blockType].refSchema);
        });
      });

      if (collectionConfig.plugins) {
        collectionConfig.plugins.forEach(plugin => {
          Schema.plugin(plugin.plugin, plugin.options);
        });
      }

      this.collections[collectionConfig.labels.singular] = {
        config: collectionConfig,
        model: mongoose.model(collectionConfig.labels.singular, Schema)
      };
    });
  };

  globalSchemaLoader = config => {
    let globalSchemaGroups = {};
    const globalFields = {};
    Object.values(config.globals).forEach(globalConfig => {
      validateGlobal(globalConfig, this.globals);
      this.globals[globalConfig.label] = config;
      globalFields[globalConfig.slug] = {};

      globalConfig.fields.forEach(field => {
        const fieldSchema = fieldToSchemaMap[field.type];
        if (fieldSchema) globalFields[globalConfig.slug][field.name] = fieldSchema(field, this.blockSchema);
      });
      globalSchemaGroups[config.slug] = new mongoose.Schema(globalFields[config.slug], {_id: false});
    });

    if (config.globals) {
      this.globalModel = mongoose.model(
        'global',
        new mongoose.Schema({...globalSchemaGroups, timestamps: false})
          .plugin(localizationPlugin, config.localization)
          .plugin(autopopulate)
      );
    }
  };
}

module.exports = SchemaLoader;
