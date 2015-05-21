# anyday
A date-agnostic to-do list. Rather than plan out your chores, let Anyday keep
track of how long it's been since you last completed it, and you decide how
long is too long.

# Installation
Anyday uses node.js and RethinkDB for it's backend infrastructure.

Thanks to the excellent Windows support node.js includes out of the box please
visit their website: [nodejs.org](https://nodejs.org/) for information on
setting up and configuring node.js.

RethinkDB on the other hand is more complicated on Windows; however, Docker
makes this process significantly more friendly with
[Boot2Docker](http://boot2docker.io/), albeit less than ideal. While Docker
also doesn't have native Windows support Boot2Docker creates a VM of a linux
instance designed for running Docker containers, and the Docker CLI is
configured to connect to it remotely.

To get started, [download Boot2Docker](https://github.com/boot2docker/windows-installer/releases)
from their respository.

Once installed, be sure to open a new command prompt, and then simply run:
    boot2docker start
    boot2docker shellinit | Invoke-Expression

This will start the VM and configure the Docker CLI to remotely access it.

You can then instrospect the VM's IP using:
`boot2docker ip`

And then it's a simple matter of running:
`docker run -d -P --name rethink1 rethinkdb`

which will bind the container to, I believe, random ports. You can introspect
the specific ports with:
`docker ps` and find the rethinkdb container.

Then you're able to access the web client with something similar to:
`192.168.59.103:32770`

Worth noting, the client port which you'll add to the config is the third
bound port in the list, corresponding to 29015.
