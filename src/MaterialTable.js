import React from 'react'
import MaterialTable from "material-table";
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { v4 as uuidv4 } from 'uuid';


const Editable = () => {
	const { useState } = React;
	const tableRef = React.createRef();

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

	// old { sdt: new Date(), sid: 0, str: 60, onOff: 1, uuid: uuidv4()}
	const [data, setData] = useState([{ datetime: new Date(), sid: 0, str: 60, onoff: 1, reoccur:true, uuid: uuidv4()}]);
	const [icon, setIcon] = useState(CheckBoxOutlineBlankIcon);

	return (
		<MaterialTable
			title="Sprinkler Schedule"
			columns={columns}
			tableRef={tableRef}
			//data={data}
			data = {query =>
				new Promise((resolve, reject) => {
					let url = 'http://localhost:3000/records';

					// if(query.search){
					// 	console.log(query.search)
					// 	url += `/filter/${query.search}`;
					//
					// 	fetch( url )
					// 		.then(response => response.json())
					// 		.then(result => {
					// 			console.log(result)
					// 			resolve({
					// 				data: result.data,
					// 				page: result.page - 1,
					// 				totalCount: result.total,
					// 			})
					// 		})
					//
					// }else
					// {
						url += `/per_page/${query.pageSize}/page/${query.page + 1}`
						fetch( url)
							.then(response => response.json())
							.then(result =>
							{
								console.log('BEFORE RESOLVE')
								resolve({
									data: result.data.filter(function(obj) {
										return Object.keys(obj).some(function(key) {
											console.log(`KEY`, key)
											console.log('VALUE', obj[key])
											return obj[key] ? (obj[key]).toString().includes(query.search) : false;
										})
									}),
									page: result.page - 1,
									totalCount: result.total,
								})
								console.log('AFTER RESOLVEEEE')
							})
					//}
				})
			}
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
								.catch(console.log)

							resolve();
						}, 1000)
					}),
				onRowUpdate: (newData, oldData) =>
					new Promise((resolve, reject) => {
						setTimeout(() => {
							// Will need to cancel the task and reschedule as well as update in the DB
							console.log('UPDATE DATA', newData)
							const {datetime, sid, str, onoff, reoccur, uuid} = newData;

							fetch('http://localhost:3000/update', {
								method: 'PUT',
								headers: {'Content-Type': 'application/json'},
								body: JSON.stringify({datetime, sid, str, onoff, reoccur, uuid})
							})
								.then(resp => resp.json())
								.catch(console.log)

							resolve();
						}, 1000)
					}),
				onRowDelete: oldData =>
					new Promise((resolve, reject) => {
						setTimeout(() => {
							// const dataDelete = [...data];
							// const index = oldData.tableData.id;
							// dataDelete.splice(index, 1);
							// setData([...dataDelete]);

							// Cancel the task, updateDB, probably really only need to send uuid
							const {uuid} = oldData;

							fetch('http://localhost:3000/delete', {
								method: 'DELETE',
								headers: {'Content-Type': 'application/json'},
								body: JSON.stringify({uuid})
							})
								.then(resp => resp.json())
								.catch(console.log)


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
					onClick: () => tableRef.current && tableRef.current.onQueryChange(),
				}
			]}
		/>
	)
}

export default Editable;