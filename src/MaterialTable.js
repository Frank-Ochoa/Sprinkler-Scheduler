import React from 'react'
import MaterialTable from "material-table";
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { v4 as uuidv4 } from 'uuid';


const Editable = () => {
	const { useState } = React;

	const [columns, setColumns] = useState([
		{ title: 'Scheduled Date/Time', field: 'sdt', type: 'datetime' },
		{ title: 'Sprinkler ID', field: 'sid', type: 'numeric'},
		{ title: 'Seconds To Run', field: 'str', type: 'numeric' },
		{
			title: 'On/Off',
			field: 'onOff',
			lookup: { 1: 'On', 0: 'Off' },
		},
	]);

	const [data, setData] = useState([{ sdt: new Date(), sid: 0, str: 60, onOff: 1, uuid: uuidv4()}]);
	const [icon, setIcon] = useState(CheckBoxOutlineBlankIcon);

	return (
		<MaterialTable
			title="Sprinkler Schedule"
			columns={columns}
			data={data}
			editable={{
				onRowAdd: newData =>
					new Promise((resolve, reject) => {
						setTimeout(() => {
							setData([...data, newData]);
							// Works
							//console.log('ATTEMPTING TO MAKE DATE FROM RESP', new Date(newData.sdt).valueOf())
							// Send the whole json to server, allow server to store in DB as well as schedule tasks based off it
							resolve();
						}, 1000)
					}),
				onRowUpdate: (newData, oldData) =>
					new Promise((resolve, reject) => {
						setTimeout(() => {
							const dataUpdate = [...data];
							const index = oldData.tableData.id;
							dataUpdate[index] = newData;
							setData([...dataUpdate]);
							// The only thing I have here is the rowData itself the rowID which can change based on
							// rows being added and or deleletd
							// Will need to cancel the task and reschedule as well as update in the DB

							resolve();
						}, 1000)
					}),
				onRowDelete: oldData =>
					new Promise((resolve, reject) => {
						setTimeout(() => {
							const dataDelete = [...data];
							const index = oldData.tableData.id;
							dataDelete.splice(index, 1);
							setData([...dataDelete]);
							// Cancel the task, updateDB

							resolve()
						}, 1000)
					}),
			}}
			options={{
				actionsColumnIndex: -1
			}}
			actions={[
				{
					icon: icon,
					tooltip: 'Set To Reoccur Weekly',
					onClick: (event, rowData) => {
						icon === CheckBoxOutlineBlankIcon ? setIcon(CheckBoxIcon) : setIcon(CheckBoxOutlineBlankIcon)
						// Cancel the task and reschehule/updateDB
						console.log(rowData)
					}
				}
			]}
		/>
	)
}

export default Editable;