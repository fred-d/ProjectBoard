@servers(['projectboard' => 'root@projectboard.tylerwebdev.io'])

@task('deploy', ['on' => 'projectboard'])
cd /home/projectboard
git pull
composer install --no-dev
service nginx reload
@endtask
