import React from 'react'
import MaterialTable from "material-table";
import { v4 as uuidv4 } from 'uuid';


const Editable = () => {
	const { useState, useEffect } = React;
	const tableRef = React.createRef();
	const PORT = 3000;

	const [columns, setColumns] = useState([
		{ title: 'Scheduled Date/Time', field: 'datetime', type: 'datetime' },
		{ title: 'Sprinkler ID', field: 'sid', type: 'numeric'},
		{ title: 'Seconds To Run', field: 'str', type: 'numeric' },
		{
			title: 'On/Off',
			field: 'onoff',
			lookup: { 1: 'On', 0: 'Off' },
		},
		{
			title: 'Weekly Reoccurrence',
			field: 'reoccur',
			lookup: { true: 'Yes', false: 'No' },
		},
	]);

	const [data, setData] = useState([]);
	const fetchRemoteData = () =>
	{
		fetch(`http://localhost:${PORT}/records`)
			.then(response => response.json())
			.then(records => setData(records.data))
			.catch(err => window.alert('Records Not Properly Fetched'))
	}

	useEffect(fetchRemoteData, [])

	return (
		<MaterialTable
			title="Sprinkler Schedule"
			columns={columns}
			tableRef={tableRef}
			data = {data}
			editable={{
				onRowAdd: newData =>
					new Promise((resolve, reject) => {
						setTimeout(() => {
							// Send the whole json to server, allow server to store in DB as well as schedule tasks based off it
							const {datetime, sid, str, onoff, reoccur} = newData;
							fetch('http://localhost:3000/entry', {
								method: 'POST',
								headers: {'Content-Type': 'application/json'},
								body: JSON.stringify({datetime, sid, str, onoff, reoccur, uuid: uuidv4()})
							})
								.then(resp => resp.json())
								.then(record => setData([...data, record]))
								.catch(err => window.alert('Unable to Schedule Task'))

							resolve();
						}, 1000)
					}),
				onRowUpdate: (newData, oldData) =>
					new Promise((resolve, reject) => {
						setTimeout(() => {
							const dataUpdate = [...data];
							dataUpdate[oldData.tableData.id] = newData;

							const {datetime, sid, str, onoff, reoccur, uuid} = newData;

							fetch('http://localhost:3000/update', {
								method: 'PUT',
								headers: {'Content-Type': 'application/json'},
								body: JSON.stringify({datetime, sid, str, onoff, reoccur, uuid})
							})
								.then(resp => resp.json())
								.then(() => setData([...dataUpdate]))
								.catch(err => window.alert('Unable To Update Task'))

							resolve();
						}, 1000)
					}),
				onRowDelete: oldData =>
					new Promise((resolve, reject) => {
						setTimeout(() => {
							const dataDelete = [...data];
							const index = oldData.tableData.id;
							dataDelete.splice(index, 1);
							// Cancel the task, updateDB, probably really only need to send uuid
							const {uuid} = oldData;

							fetch('http://localhost:3000/delete', {
								method: 'DELETE',
								headers: {'Content-Type': 'application/json'},
								body: JSON.stringify({uuid})
							})
								.then(() => setData(dataDelete))
								.catch(window.alert)


							resolve()
						}, 1000)
					}),
			}}
			options={{
				actionsColumnIndex: -1
			}}
			actions={[
				{
					icon: 'refresh',
					tooltip: 'Refresh Data',
					isFreeAction: true,
					onClick: fetchRemoteData,
				}
			]}
		/>
	)
}

export default Editable;