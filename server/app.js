const express = require('express')
const bodyParser = require('body-parser')
const { MongoClient, ObjectId } = require('mongodb')

const { MONGO_USER = '', MONGO_PASS = '', MONGO_HOST = 'localhost', MONGO_PORT = '27017' } = process.env
const MONGO_URL = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}`

const APP_PORT = process.env.PORT || 4000
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.post('/create-task', async (req, res) => {
	const task = req.body

	if (!task.title) {
		return res.redirect('/')
	}

	const { client, todos } = await getMongoClient()
	const result = await todos.insertOne(task)

	await client.close()

	res.redirect('/')
})

app.post('/complete-task', async (req, res) => {
	const taskId = req.body.id

	if (!taskId) {
		return res.redirect('/')
	}

	const { client, todos } = await getMongoClient()
	const result = await todos.updateOne(
		{ _id: new ObjectId(taskId) },
		{
			$set: {
				status: 'COMPLETED',
			},
		}
	)

	await client.close()

	res.redirect('/')
})

app.get('/', async (req, res) => {
	const active = await getActiveTasks()
	const completed = await getCompletedTasks()

	res.render('index', { active, completed })
})

app.listen(APP_PORT, () => {
	console.log('The server is running on port: ', APP_PORT)
})

async function getMongoClient() {
	const client = await MongoClient.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
	const todos = client.db('faber').collection('todos')

	return { client, todos }
}

async function getActiveTasks() {
	const operations = [
		{
			$limit: 10,
		},
		{
			$match: {
				status: {
					$ne: 'COMPLETED',
				},
			},
		},
	]

	const { client, todos } = await getMongoClient()
	const cursor = todos.aggregate(operations)
	const result = await cursor.toArray()

	await client.close()

	return result
}

async function getCompletedTasks() {
	const operations = [
		{
			$limit: 10,
		},
		{
			$match: {
				status: 'COMPLETED',
			},
		},
		{
			$project: {
				_id: 0,
				status: 0,
			},
		},
	]

	const { client, todos } = await getMongoClient()
	const cursor = todos.aggregate(operations)
	const result = await cursor.toArray()

	await client.close()

	return result
}
