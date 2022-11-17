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

	useEffect(() => {
		loadTasks()
	}, [])

	return (
		<div className="container">
			<h2>A Simple ToDo List App</h2>

			<form action="#" method="post">
				<input type="text" name="title" placeholder="add new task" />
				<button>Add Task</button>
			</form>

			<h2>Pending Tasks</h2>

			<ul>
				{active.map(task => (
					<li key={task._id}>
						<form action="#" method="post">
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
