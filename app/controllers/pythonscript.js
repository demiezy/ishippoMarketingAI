// pythonModel();

// setInterval(pythonModel, 1000*20)

function pythonModel() {

	var { spawn } = require('child_process');
	var pyProg = spawn('python',['/var/www/html/model.py']);

	pyProg.stdout.on('data', function(data) {

        console.log(data.toString());
        // res.write(data);
        // res.end('end');
    });

    pyProg.stderr.on('data', (data) => {

        console.log(data);
    });
}