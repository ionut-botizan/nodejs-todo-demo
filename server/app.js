const express = require('express')
const bodyParser = require('body-parser')
const { MongoClient, ObjectId } = require('mongodb')

const fs = require('node:fs/promises')
const path = require('node:path')

const { MONGO_USER = '', MONGO_PASS = '', MONGO_HOST = 'localhost', MONGO_PORT = '27017' } = process.env
const MONGO_URL = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}`

const APP_PORT = process.env.PORT || 4000
const app = express()

app.use(bodyParser.json({ extended: true }))
app.use(express.static('dist/client', { index: false }))
app.use(express.static('public', { index: false }))

app.post('/api/create-task', async (req, res) => {
	const task = req.body

	if (!task.title) {
		return res.status(400).json({})
	}

	const { client, todos } = await getMongoClient()
	const result = await todos.insertOne(task)

	await client.close()

	res.json(result)
})

app.post('/api/complete-task', async (req, res) => {
	const taskId = req.body.id

	if (!taskId) {
		return res.status(400).json({})
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

	res.json(result)
})

app.get('/api/tasks', async (req, res) => {
	const active = await getActiveTasks()
	const completed = await getCompletedTasks()

	res.json({ active, completed })
})

app.use('*', async (req, res, next) => {
	const url = req.originalUrl
	const [active, completed] = await Promise.all([getActiveTasks(), getCompletedTasks()])
	const initialData = { active, completed }

	const template = await fs.readFile(path.resolve(__dirname, '../dist/client/index.html'), 'utf-8')
	const render = (await import('../dist/server/entry-server.mjs')).render

	const appHtml = render(url, initialData)
	const html = template.replace('<!--ssr-html-->', appHtml)

	res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
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
			$limit: 100,
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
			$limit: 100,
		},
		{
			$match: {
				status: 'COMPLETED',
			},
		},
		{
			$project: {
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
