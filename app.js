const express = require('express');
const mongoose = require('mongoose');
const { graphqlHTTP } = require('express-graphql');


const schema = require('./schema/index');
const resolvers = require('./resolvers/index');

const app = express();

app.use(express.json());

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue:resolvers ,
    graphiql:true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.rt7oo.gcp.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
    .then(() =>
    {
        app.listen(3000, () => console.log("App listening on port 3000"));
    })
    .catch(err => console.log(err));

