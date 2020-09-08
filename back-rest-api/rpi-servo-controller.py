import RPi.GPIO as GPIO
import time
import sys


t = 0
direction = ''
servo = None
# Frequencies
center_freq = 7
right_freq = 12.5
left_freq = 2.5
# Servo pin
servo_pin = 7


def setup():
  global t
  global direction
  global servo
  GPIO.setmode(GPIO.BOARD)
  GPIO.setup(servo_pin, GPIO.OUT) 
  t = float(sys.argv[sys.argv.index('-t') + 1])
  direction = sys.argv[sys.argv.index('-d') + 1]
  servo = GPIO.PWM(servo_pin, 50)
  print(float(sys.argv[sys.argv.index('-t') + 1]), sys.argv[sys.argv.index('-d') + 1])

def main():
  try:
    setup() 
    print(t,direction,servo, sys.argv)
    if direction and t:
      servo_move(direction, t)
    else:
      print('Error: missing direction or time')

  except KeyboardInterrupt:
    print('Error: turn servo error')

  finally:
    print('clean up')
    # servo.stop()
    GPIO.cleanup()

def servo_move(_direction, t=1):
  directionFreq = 0
  if _direction=='right':
    directionFreq = right_freq
  elif direction=='left':
    directionFreq = left_freq
  elif direction == 'center':
    directionFreq = center_freq
  else:
    print('Error: direction mismatch')

  servo.start(center_freq)
  servo.ChangeDutyCycle(directionFreq)
  time.sleep(t)
  servo.stop()
  # GPIO.cleanup()

if __name__ == "__main__":
    # execute only if run as a script
    main()