const MongoClient = require('mongodb').MongoClient

// Connection URL
var url = 'mongodb://localhost:27017/rdflib'

// Use connect method to connect to the server
MongoClient.connect(url)
.then((db) => {
  console.log('Connected correctly to server')
  // var collection = db.collection('documents')
  // return collection
  // .createIndex({a: 1, b: 1}
  //     , {unique: true, background: true, w: 1})
  //     .then(() => { return db })
  return db
})
.then(db => insertDocuments(db))
.then(db => findDocuments(db))
.then(db => deleteDocuments(db))
.then(db => findDocuments(db))
.then(db => db.close())
.catch(err => {
  console.log(err)
  throw (err)
})

var insertDocuments = function (db) {
  // Get the documents collection
  var collection = db.collection('documents')
  // Insert some documents
  return collection.insertMany([
    {a: 1, b: 1},
    {a: 1, b: 2}
  ]).catch(err => {
    if (err.code === 11000) {
      console.log(err.message)
    } else { throw (err) }
  })
  .then((result) => {
    // console.log('Inserted 3 documents into the collection')
    return db
  })
}
var deleteDocuments = function (db) {
  // Get the documents collection
  var collection = db.collection('documents')
  // Insert some documents
  return collection.deleteMany(
    {a: 1, b: 1}
  )
  .then((result) => {
    return db
  })
}
var findDocuments = function (db) {
  // Get the documents collection
  var collection = db.collection('documents')
  // Find some documents
  return collection
  .find({})
  .project({_id: 0})
  .toArray()
  .then((arr) => {
    console.log('Found the following records')
    console.log(arr)
    return db
  })
}
