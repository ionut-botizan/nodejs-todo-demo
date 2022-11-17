import { useState, useEffect, useCallback } from 'react'
import './styles.css'

export default function App() {
	const [active, setActive] = useState([])
	const [completed, setCompleted] = useState([])

	const loadTasks = useCallback(async () => {
		const response = await fetch('/api/tasks')
		const tasks = await response.json()

		setActive(tasks.active)
		setCompleted(tasks.completed)
	})

	const createTask = useCallback(async evt => {
		evt.preventDefault()
		const form = evt.target
		const data = new FormData(form)
		const task = Object.fromEntries(data.entries())

		await fetch('/api/create-task', {
			method: 'post',
			body: JSON.stringify(task),
			headers: { 'Content-Type': 'application/json' },
		})

		form.reset()

		loadTasks()
	})

	const completeTask = useCallback(async evt => {
		evt.preventDefault()
		const form = evt.target
		const data = new FormData(form)
		const task = Object.fromEntries(data.entries())

		await fetch('/api/complete-task', {
			method: 'post',
			body: JSON.stringify(task),
			headers: { 'Content-Type': 'application/json' },
		})

		loadTasks()
	})

	useEffect(() => {
		loadTasks()
	}, [])

	return (
		<div className="container">
			<h2>A Simple ToDo List App</h2>

			<form action="#" method="post" onSubmit={createTask}>
				<input type="text" name="title" placeholder="add new task" />
				<button>Add Task</button>
			</form>

			<h2>Pending Tasks</h2>

			<ul>
				{active.map(task => (
					<li key={task._id}>
						<form action="#" method="post" onSubmit={completeTask}>
							<input type="hidden" name="id" value={task._id} />
							<button>✔</button> {task.title}
						</form>
					</li>
				))}
			</ul>

			<h2>Completed Tasks</h2>

			{completed.map(task => (
				<li key={task._id}>✔ {task.title}</li>
			))}
		</div>
	)
}
