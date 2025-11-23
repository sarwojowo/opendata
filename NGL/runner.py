import sqlite3
import time
import json
import urllib.request
from gpiozero import LED

CONTROLLER_ID = 'AB2EW'
DB_NAME = "slamp-{0}.db".format(CONTROLLER_ID)
APPL_URL = "http://10.10.1.86:8001/slamp"
API_URL = "{0}/api/controller/{1}.do".format(APPL_URL, CONTROLLER_ID)
REFRESH_RATE = 5 # in second

sql_config_table = """CREATE TABLE IF NOT EXISTS config(
pin integer primary key,
time_start text not null,
time_end text not null,
lamp_stat integer not null);"""

ledstat = {}
led = {}

# kode yang lama, pakai ledstat
def turn_on_lamp(pin):
    if pin in ledstat:
        if ledstat[pin] == 0:
            ledstat[pin] = 1
            led[pin].on() # print('turn on pin {0}'.format(pin)) 
    else:
        ledstat[pin] = 1
        led[pin] = LED(pin) # print('set led pin of {0}'.format(pin))
        led[pin].on() # print('turn on pin {0}'.format(pin))

# kode yang baru, pakai led.is_lit
def turn_on_lamp_new(pin):
    if pin in led and not led[pin].is_lit:
        led[pin].on()
    elif pin not in led:
        led[pin] = LED(pin)
        led[pin].on()

def turn_off_lamp(pin):
    if pin in ledstat:
        if ledstat[pin] == 1:
            ledstat[pin] = 0
            led[pin].off() # print('turn off pin {0}'.format(pin)) 
    else:
        ledstat[pin] = 0
        led[pin] = LED(pin) # print('set led pin of {0}'.format(pin))
        led[pin].off() # print('turn off pin {0}'.format(pin)) 

def turn_off_lamp_new(pin):
    if pin in led and led[pin].is_lit:
        led[pin].off()
    elif pin not in led:
        led[pin] = LED(pin)
        led[pin].off()

def create_connection(db_file):
    """ create a databse connection to a SQLite databse """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        print('Connected to SQLite Database : {0}'.format(sqlite3.version))
    except Exception as e:
        print(e)
    finally:
        return conn


def execute_query(conn, sql):
    """ execute non DML query """
    try:
        c = conn.cursor()
        c.execute(sql)
    except Exception as e:
        print(e)


def insert_config_data(conn, data):
    ins = '''INSERT INTO config(time_start,time_end,lamp_stat,pin) values(?,?,?,?)'''
    upd = '''UPDATE config SET time_start=?,time_end=?,lamp_stat=? WHERE pin=?'''
    cur = conn.cursor()
    try:
        cur.execute(ins, data)
    except sqlite3.IntegrityError:
        cur.execute(upd, data)
    finally:
        conn.commit()


def fetch_data(conn):
    sql = '''SELECT * FROM config'''
    cur = conn.cursor()
    try:
        cur.execute(sql)
        rows = cur.fetchall()
        return rows
    except Exception as e:
        print(e)
        return None


def is_time_between(begin_time, end_time, check_time=None):
    check_time = check_time or time.localtime()
    return check_time >= begin_time and check_time <= end_time
#    if begin_time < end_time:
#        return check_time >= begin_time and check_time <= end_time
#    else
#        return check_time >= begin_time or check_time <= end_time


def is_time_between_str(begin, end, fmt='%H:%M'):
    begin_time = time.strptime(begin, fmt)
    end_time = time.strptime(end, fmt)
    now_time = time.strptime(time.strftime(fmt), fmt)
    return is_time_between(begin_time, end_time, now_time)


if __name__ == '__main__':
    print('Runner Job Start on {0}'.format(
        time.strftime('%a, %d-%m-%Y %H:%M:%S')))
    conn = create_connection(DB_NAME)
    execute_query(conn, sql_config_table)
    while True:
        try:
            response = urllib.request.urlopen(API_URL).read().decode()
            data = json.loads(response)

            for obj in data:
                if obj['isLampOn']:
                    turn_on_lamp(obj['pin'])
                else:
                    turn_off_lamp(obj['pin'])
                insert_config_data(conn, (obj['configTimeStart'], obj['configTimeEnd'], obj['configLampStatus'], obj['pin']))
            print('Successfuly configured lamp by network configuration: {0}'.format(
                time.strftime('%d-%m %H:%M:%S')))
        except Exception as e:
            # failed to fetch data from url
            # fetch data from database
            for row in fetch_data(conn):
                if is_time_between_str(row[1], row[2]):
                    if row[3] == 1:
                        turn_on_lamp(row[0])
                    else:
                        turn_off_lamp(row[0])
                else:
                    if row[3] == 1:
                        turn_off_lamp(row[0]) #led.off()
                    else:
                        turn_on_lamp(row[0]) #led.on()
            print('Successfuly configured lamp by stored configuration: {0}'.format(
                time.strftime('%d-%m %H:%M:%S')))
        finally:
            time.sleep(REFRESH_RATE)
