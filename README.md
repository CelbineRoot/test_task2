Прошу не обращать внимание на качество кода, всё писалось на скорую руку.

* код в рабочем состоянии
* по вашему желанию, могу сделать фронт состовляющую, всё будет круто
* тестирование проводилось через postman

Для запуска потребуется:

``docker-compose build``
``docker-compose up -d``

После чего необходимо создать запись в базе данных в таблице **roulete-options**, значения можно оставить дефолтными, далее перезапустить приложение

Создать двух человек, у них будет 1к на балансе по умолчанию:

``POST: http://localhost:3000/users/randomUser``

Состояние игры получать:

``GET: http://localhost:3000/roulete/``

Далее необходимо подключиться к веб-сокетам (socket-io) на путь

``localhost:3000``

Далее необходимо отправить событие:

* ``Event: addBet``
* ``{
  "userId": "ID пользователя",
  "amount": 10
  }``

Для запуска игры необходимо ставки минимум от 2 игроков. Спасибо!
