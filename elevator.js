class ElevatorController {
    constructor(floors, elevator_count) {
        this.floors = floors;
        this.queue = [];
        this.elevators = [];
        for (var i = 0; i < elevator_count; ++i) {
            this.elevators.push(new Elevator(i, this.floors));
        }
    }

    request(from_floor, to_floor) {
        this.queue.push({ from_floor: from_floor, to_floor: to_floor });
    }

    tick() {
        // first, decide on the action of each elevator
        // this is done by looping through the queue and looking at any requests that are not being serviced
        //      elevator actions include: start, move up, move down, stop, open doors, close doors, maintenance mode, maintained
        //      if an elevator is in progress, then don't stop it unless a request comes in that is on it's current path
        //
        this.queue.forEach((request) => {
            var best_elevator = null;
            // find stopped elevator on current floor
            this.elevators.forEach(elevator => {
                if (elevator.direction == 0 && elevator.current_floor == request.from_floor) {
                    best_elevator = elevator;
                }
            });
            if (!best_elevator) {
                this.elevators.forEach(elevator => {
                    if (elevator.direction != 0 &&
                        elevator.requests.length &&
                        (
                            (elevator.direction ==  1 && elevator.current_floor < request.from_floor && elevator.requests[0].to_floor >= request.from_floor) ||
                            (elevator.direction == -1 && elevator.current_floor > request.from_floor && elevator.requests[0].to_floor <= request.from_floor)
                        )
                    ) {
                        best_elevator = elevator;
                    }
                });
            }
            if (!best_elevator) {
                this.elevators.forEach(elevator => {
                    if (elevator.direction != 0) return;
                    if (!best_elevator) return best_elevator = elevator;
                    if (Math.abs(elevator.current_floor - request.from_floor) < Math.abs(best_elevator.current_floor - request.from_floor)) {
                        best_elevator = elevator;
                    }
                });
            }
            if (best_elevator) {
                best_elevator.requests.push(request);
                request.assigned = true;
            }
        });

        this.queue = this.queue.filter(request => !request.assigned);

        this.elevators.forEach(elevator => {
            elevator.tick();
        });
    }
}

class Elevator {
    constructor(id, floors) {
        this.id = id;
        this.floors = floors;
        this.current_floor = 1;
        this.requests = [];
        this.door_open = 0;
        this.occupied = 0;
        this.direction = 0;
        this.trips = 0;
    }

    tick() {
        // if not moving and not occupied and at from_floor, open doors + become occupied
        if (this.direction == 0 && !this.occupied && this.requests.length && this.current_floor == this.requests[0].from_floor) {
            this.door_open = 1;
            this.occupied = 1;
            this.log('pick up passengers at ' + this.current_floor);

        // if not moving and occupied and at to_floor, open doors + become unoccupied
        } else if (this.direction == 0 && this.occupied && this.current_floor == this.requests[0].to_floor) {
            this.door_open = 1;
            this.occupied = 0;
            this.log('drop off passengers at ' + this.current_floor);
            this.requests.shift();

        // if not moving and target floor, start
        } else if (this.direction == 0 && this.requests.length) {
            var request = this.requests[0];
            var target_floor = this.occupied ? this.requests[0].to_floor : this.requests[0].from_floor;
            if (target_floor > this.current_floor) {
                this.direction = 1;
                this.log('start moving up')
            } else {
                this.direction = -1;
                this.log('start moving down')
            }

        // if moving and reached target floor, stop
        } else if (this.direction != 0 && ((!this.occupied && this.current_floor == this.requests[0].from_floor) || (this.occupied && this.current_floor == this.requests[0].to_floor))) {
            this.direction = 0;
            this.log('stop at ' + this.current_floor)

        // if moving and not reached target floor, move
        } else if (this.direction != 0) {
            this.current_floor += this.direction;
            this.log('moving ' + (this.direction > 0 ? 'up' : 'down'));

        // if doors open, close doors
        } else if (this.door_open) {
            this.door_open = 0;
            this.log('close doors');
        } else {
            //this.log('do nothing');
        }
    }

    log(msg) {
        console.log('elevator-' + this.id + ' at ' + this.current_floor + ': ' + msg);
    }
}

var controller = new ElevatorController(10, 3);
controller.request(3, 5);
controller.request(4, 6);
for (var i = 0; i < 100; ++i) {
    controller.tick();
}
