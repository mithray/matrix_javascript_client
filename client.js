const sdk = require("matrix-js-sdk")
const parse = require('url-parse')
const fetch = require("node-fetch")
const crypto = require("crypto")
//const yaml

const serverURL = ('http://localhost:8008')
const endpoints={
	login: "/_matrix/client/r0/login",
	register: "/_matrix/client/r0/register",
	createRoom: "/_matrix/client/r0/createRoom?access_token=$access_token",
	sendMessage: "/_matrix/client/r0/rooms/$room_id/send/m.room.message?access_token=$access_token",
	sync: "/_matrix/client/r0/sync?access_token=$access_token"
}

async function createRandomUserObject(){
	const userObject = { 
		username: crypto.randomBytes(10).toString('hex'), 
		password: crypto.randomBytes(20).toString('hex')
	}
	return userObject
}
async function register(user){

	const obj = {
		method: 'POST', 
		body: JSON.stringify({
			username: user.username, 
			password: user.password, 
			type: "m.login.dummy",
			auth: {
				type: "m.login.dummy", 
				username: user.username,
				password: user.password
			}
		}),
		headers: { 'Content-Type': 'application/json'}
	}

	return await fetch( serverURL + endpoints.register, obj )
}
async function login(user){
	const obj = {
		method: 'POST', 
		body: JSON.stringify({
			type: "m.login.password",
			user: user.username,
			password: user.password
		}), 
		headers: { 'Content-Type': 'application/json'}		
	}
	const uri = serverURL + endpoints.login
	return await fetch( uri, obj )
}
async function createRoom(name,access_token){
	const obj = {
		method: 'POST', 
		body: JSON.stringify({
			room_alias_name: name,
		}),
		headers: { 'Content-Type': 'application/json'}
	}
	var uri = ""
	uri = serverURL + endpoints.createRoom
	uri = uri.replace(/\$access_token/, access_token)
	return await fetch( uri, obj )
}
async function sendMessage(args){
	const obj = {
		method: 'POST', 
		body: JSON.stringify({
			msgtype: args.msgtype,
			body: args.body
		}), 
		headers: { 
			'Content-Type': 'application/json'
		}
	}
	var uri = serverURL + endpoints.sendMessage
	uri = uri.replace(/\$access_token/, args.access_token)
	uri = uri.replace(/\$room_id/, args.room_id)
	return await fetch( uri, obj)
}
async function sync(args){
	const obj = {
		method: 'GET', 
		headers: { 
			'Content-Type': 'application/json'
		}
	}
	var uri = serverURL + endpoints.sync
	uri = uri.replace(/\$access_token/, args.access_token)
	return await fetch( uri, obj)
}
async function main(){
	const user = {
		username: '7kxo8eua9aoe',
		password: 'thknntaheo89'
	}//await createRandomUserObject()
	/*
	const registration = await register(registrationObject)
	*/
	const loginResponse = await login(user)
	const res = await loginResponse.json()
	/*
	console.log(res)
	const createRoomResponse =  await createRoom('programming2',res.access_token)
	console.log(await createRoomResponse.json())
	*/
	const room_id = "!XZFWPTkQHhIrlAwutV:boss"

	const sendMessageResponse = await sendMessage({msgtype:"m.text",body: "hi! how are you ? ", access_token: res.access_token, room_id: room_id})
	console.log('sendMessageResponse:')
	console.log(await sendMessageResponse.json())
	const syncResponse = await sync({access_token: res.access_token})
	console.log('syncResponse:')
	const res2 = await syncResponse.json()
	console.log(res2.account_data.events[0].content.global)
}
main()
