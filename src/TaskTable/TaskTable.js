import React, { useEffect, useState, useCallback } from 'react';
import { ReactTabulator } from 'react-tabulator'; 
import 'react-tabulator/lib/styles.css'; 
import 'react-tabulator/lib/css/tabulator.min.css'; 
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

const TaskTable = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', description: '', status: 'To Do' });
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTasks = useCallback(async () => {
        const response = await axios.get('https://jsonplaceholder.typicode.com/todos');
        const initialTasks = response.data.map(task => ({
            id: task.id,
            title: task.title,
            description: '', 
            status: task.completed ? 'Done' : 'To Do'
        }));
        setTasks(initialTasks);
    }, []);

    const deleteRow = useCallback((row) => {
        const updatedTasks = tasks.filter(task => task.id !== row.id);
        setTasks(updatedTasks);
        toast.success('Task deleted successfully!'); 
    }, [tasks]);

    const addTask = () => {
        if (!newTask.title) return; 
        const newId = tasks.length ? Math.max(tasks.map(task => task.id)) + 1 : 1; 
        const taskToAdd = { id: newId, ...newTask };
        setTasks(prevTasks => [...prevTasks, taskToAdd]); 
        toast.success('Task added successfully!'); 
        setNewTask({ title: '', description: '', status: 'To Do' }); 
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusFilterChange = (e) => {
        setFilter(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const columns = [
        {
            title: 'Task ID',
            field: 'id',
            width: 100,
            tooltip: 'Task ID', 
        },
        {
            title: 'Title',
            field: 'title',
            editor: 'input',
            tooltip: 'Task Title',
        },
        {
            title: 'Description',
            field: 'description',
            editor: 'input',
            tooltip: 'Task Description', 
        },
        {
            title: 'Status',
            field: 'status',
            editor: 'select',
            editorParams: { values: ['To Do', 'In Progress', 'Done'] },
            tooltip: 'Task Status', 
        },
        {
            title: 'Delete',
            field: 'delete',
            formatter: 'buttonCross',
            width: 100,
            cellClick: (e, cell) => deleteRow(cell.getRow().getData()),
            tooltip: 'Delete Task', 
        },
    ];

    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filter === 'All' || task.status === filter;
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              task.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const taskCounts = {
        'To Do': tasks.filter(task => task.status === 'To Do').length,
        'In Progress': tasks.filter(task => task.status === 'In Progress').length,
        'Done': tasks.filter(task => task.status === 'Done').length,
    };

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return (
        <div>
            <ToastContainer />
            <h2 className="h1 mt-3 mb-3">Task List Management</h2>

            <div className='mt-5 mb-5'>
                <input 
                    type="text" 
                    name="title" 
                    placeholder="Task Title" 
                    value={newTask.title} 
                    onChange={handleInputChange} 
                    className='border border-3 rounded-2 px-2 py-1 mr-4'
                />
                <input 
                    type="text" 
                    name="description" 
                    placeholder="Task Description" 
                    value={newTask.description} 
                    onChange={handleInputChange} 
                    className='border border-3 rounded-2 px-2 py-1 mr-4'
                />
                <select 
                    name="status" 
                    value={newTask.status} 
                    onChange={handleInputChange}
                    className='border border-3 rounded-2 px-2 py-1 mr-4'
                >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>

                <button onClick={addTask} className='btn btn-primary'>Add Task</button>

            </div>

            <div className='d-flex justify-content-center'>

                <div>

                    <label className='fs-5'>Filter : </label>
                    <select value={filter} onChange={handleStatusFilterChange} className='border border-3 rounded-2 mb-4 ml-2 px-2 py-1'>
                        <option value="All">All</option>
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>

                </div>

                <div className='mb-4 ml-5'>
                    <label className='fs-5'>Search : </label>
                    <input 
                        type="text" 
                        placeholder="Title or Description" 
                        value={searchTerm} 
                        onChange={handleSearchChange} 
                        className='border border-3 rounded-2 px-2 py-1 ml-2'
                    />
                </div>

            </div>

            <div className='mb-4'>

                <h5 className='mb-4 mt-2'>Status Counter</h5>

                <div className='mb-4 d-flex justify-content-center'>

                    <div className="card w-40 mr-5 bg-light">
                        <div class="card-body">
                            <h5 class="card-title">To Do</h5>
                            <p class="card-text mt-4 fs-5 text-primary">{taskCounts['To Do']}</p>
                        </div>
                    </div>

                    <div className="card w-40 mr-5 bg-light">
                        <div class="card-body">
                            <h5 class="card-title">In Progress</h5>
                            <p class="card-text mt-4 fs-5 text-primary">{taskCounts['In Progress']}</p>
                        </div>
                    </div>

                    <div className="card w-40 bg-light">
                        <div class="card-body">
                            <h5 class="card-title">Done</h5>
                            <p class="card-text mt-4 fs-5 text-primary">{taskCounts['Done']}</p>
                        </div>
                    </div>

                </div>

            </div>

            <ReactTabulator
                data={filteredTasks}
                columns={columns}
                options={{
                    layout: 'fitData',
                    pagination: 'local',
                    paginationSize: 20,
                }}
            />
        </div>
    );
};

export { TaskTable };