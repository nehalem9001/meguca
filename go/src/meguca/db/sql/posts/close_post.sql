update posts
	set editing = false,
		body = $2,
		commands = $3,
		password = null
	where id = $1
	returning bump_thread(op, false, false, false)
