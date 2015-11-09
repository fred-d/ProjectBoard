@servers(['projectboard' => 'root@projectboard.tylerwebdev.io'])

@task('deploy', ['on' => 'projectboard'])
cd /home/projectboard
git pull
npm update
@endtask
