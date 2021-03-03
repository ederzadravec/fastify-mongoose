import { FastifyInstance, HookHandlerDoneFunction } from 'fastify';
import * as mongoose from 'mongoose';
import FP from 'fastify-plugin'
export interface Model {
  name: string;
  alias?: string;
  schema: mongoose.SchemaDefinition;
  options?: mongoose.SchemaOptions;
  class?: any;
  virtualize?: (schema: mongoose.Schema) => void;
}

export interface Options {
  uri: string;
  settings?: mongoose.ConnectionOptions;
  models?: Model[];
  useNameAndAlias?: boolean;
}

export interface Decorator {
  [key: string]: Model | any;
  instance: mongoose.Connection | void;
}


const register = async (
  fastify: FastifyInstance,
  { uri, settings, models, useNameAndAlias }: Options,
  done: HookHandlerDoneFunction
) => {
  const instance = await mongoose
    .connect(uri, settings)
    .then(() => console.log('Mongo connected'))
    .catch((error: any) => console.log('Mongo connection error: ', error));

  fastify.addHook('onClose', (app: any, done: any) => {
    app.mongoose.instance.connection.on('close', function () {
      done();
    });
    app.mongoose.instance.connection.close();
  });

  let decorator = {
    instance,
  } as Decorator;

  if (models && models.length !== 0) {
    models.forEach((model) => {
      const schema = new mongoose.Schema(model.schema, model.options);

      if (model.class) schema.loadClass(model.class);

      if (model.virtualize) model.virtualize(schema);

      if (useNameAndAlias) {
        if (!model.alias) {
          throw new Error(`No alias defined for ${model.name}`);
        }

        decorator = {
          ...decorator,
          [model.alias]: mongoose.model(model.alias, schema, model.name),
        };
      } else {
        const key = model.alias || `${model.name[0].toUpperCase()}${model.name.slice(1)}`;

        decorator = { ...decorator, [key]: mongoose.model(model.name, schema) };
      }
    });
  }

  fastify.decorate('mongoose', decorator);

  done();
};

export const plugin = FP(register)
