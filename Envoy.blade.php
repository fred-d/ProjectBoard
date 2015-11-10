@servers(['projectboard' => 'root@projects.tylerwebdev.io'])

@task('deploy', ['on' => 'projectboard'])
cd /home/ProjectBoard
pm2 stop projectboard
git pull
npm update
pm2 start projectboard
@endtask
