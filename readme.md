# Fastify MongoDB Plugin using Mongoose and typescript

## Installation

```bash
yarn add @ederzadravec/fastify-mongoose
```

## Usage

```typescript
// ...Other Plugins
fastify.register(
  require("fastify-mongoose-driver").plugin,
  {
    uri: "mongodb://admin:pass@localhost:27017/database_name",
    settings: {
      useNewUrlParser: true,
      config: {
        autoIndex: true,
      },
    },
    models: [
      {
        name: "posts",
        alias: "Post",
        schema: {
          title: {
            type: String,
            required: true,
          },
          content: {
            type: String,
            required: true,
          },
          author: {
            type: "ObjectId",
            ref: "Account",
          },
        },
      },
      {
        name: "accounts",
        alias: "Account",
        schema: {
          username: {
            type: String,
          },
          password: {
            type: String,
            select: false,
            required: true,
          },
          email: {
            type: String,
            unique: true,
            required: true,
          },
          createdAtUTC: {
            type: Date,
            required: true,
          },
        },
        virtualize: (schema) => {
          schema.virtual("posts", {
            ref: "Post",
            localKey: "_id",
            foreignKey: "author",
          });
        },
      },
    ],
    useNameAndAlias: true,
  },
  (err) => {
    if (err) throw err;
  }
);

fastify.get("/", (request, reply) => {
  console.log(fastify.mongoose.instance); // Mongoose ODM instance
  console.log(fastify.mongoose.Account); // Any models declared are available here
});

```

## Options

| Option            | Description                                                                                                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uri`             | Required, the Unique Resource Identifier to use when connecting to the Database.                                                                                                                      |
| `settings`        | Optional, the settings to be passed on to the MongoDB Driver as well as the Mongoose-specific options. [Refer here for further info](https://mongoosejs.com/docs/api.html#mongoose_Mongoose-connect). |
| `models`          | Optional, any models to be declared and injected under `fastify.mongoose`                                                                                                                             |
| `useNameAndAlias` | Optional, declares models using `mongoose.model(alias, schema, name)` instead of `mongoose.model(name, schema)`                                                                                       |

Any models declared should follow the following format:

```javascript
{
  name: "profiles", // Required, should match name of model in database
  alias: "Profile", // Optional, an alias to inject the model as
  schema: schemaDefinition // Required, should match schema of model in database,
  class: classDefinition // Optional, should be an ES6 class wrapper for the model
}
```

The `schemaDefinition` variable should be created according to the [Mongoose Model Specification](https://mongoosejs.com/docs/schematypes.html).
The `classDefinition` variable should be created according to the [Mongoose Class Specification](https://mongoosejs.com/docs/4.x/docs/advanced_schemas.html).

## Refer

this library was based on [fastify-mongoose](https://github.com/alex-ppg/fastify-mongoose) of [Alexander Papageorgiou](https://github.com/alex-ppg)

I rewrote in typescript using your repository as a base
