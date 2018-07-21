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

    assign_requests() {
        this.queue.forEach((request) => {
            var best_elevator = null;
            // ignore elevators that are marked for maintenance
            var elevators = this.elevators.filter(elevator => !elevator.in_maintenance);

            // if there is a stopped elevator on the from floor, use that one
            elevators.forEach(elevator => {
                if (elevator.direction == 0 && elevator.current_floor == request.from_floor) {
                    best_elevator = elevator;
                }
            });

            // if there is an elevator moving that will pass the from floor and is moving in the right direction, use that one
            if (!best_elevator) {
                var request_dir = request.to_floor > request.from_floor ? 1 : -1;
                elevators.forEach(elevator => {
                    if (
                        (request_dir ==  1 && elevator.direction ==  1 && elevator.current_floor < request.from_floor && elevator.requests[0].to_floor >= request.from_floor) ||
                        (request_dir == -1 && elevator.direction == -1 && elevator.current_floor > request.from_floor && elevator.requests[0].to_floor <= request.from_floor)
                    ) {
                        best_elevator = elevator;
                    }
                });
            }

            // otherwise, just pick the elevator that is closest and not in use
            if (!best_elevator) {
                elevators.forEach(elevator => {
                    if (elevator.direction != 0) return;
                    if (!best_elevator) return best_elevator = elevator;
                    if (Math.abs(elevator.current_floor - request.from_floor) < Math.abs(best_elevator.current_floor - request.from_floor)) {
                        best_elevator = elevator;
                    }
                });
            }

            // if an elevator matched, then dispatch it!
            if (best_elevator) {
                best_elevator.dispatch(request);
                request.assigned = true;
            }
        });

        // remove requests from queue that were assigned out
        this.queue = this.queue.filter(request => !request.assigned);
    }

    tick() {
        this.assign_requests();
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
        this.direction = 0;
        this.trips = 0;
        this.in_maintenance = 0;
    }

    dispatch(request) {
        var already_booked = this.requests.some(existing_request => {
            return existing_request.from_floor == request.from_floor && existing_request.to_floor == request.to_floor;
        });
        if (already_booked) return;
        this.trips += 1;
        this.requests.push(request)
        if (this.trips >= 100) {
            this.in_maintenance = 100; // assume 100 ticks are needed to service an elevator
            this.log('maintenance needed');
        }
    }

    occupied() {
        return this.requests.some(request => request.picked_up);
    }

    // an elevator can perform 1 action per tick
    // elevator actions include: start, move up, move down, stop, open doors, close doors, or be serviced
    // passengers getting on or off do not count as an action, and will happen whenever the doors are open
    tick() {
        // if we have no requests assigned, and we need to service the elevator, don't do anything
        if (!this.requests.length && this.in_maintenance > 0) {
            this.log('servicing');
            this.in_maintenance -= 1;
            if (this.in_maintenance == 0) {
                this.trips = 0;
            }
            return;
        }

        var from_floors = this.requests.filter(request => !request.picked_up).map(request => request.from_floor);
        var to_floors   = this.requests.filter(request =>  request.picked_up).map(request => request.to_floor);

        // if doors open, close doors
        if (this.door_open) {
            this.door_open = 0;
            this.log('close doors');

        // if not moving and not occupied and at from_floor, open doors + become occupied
        } else if (this.direction == 0 && !this.occupied() && from_floors.indexOf(this.current_floor) != -1) {
            this.door_open = 1;
            this.log('open doors');

        // if not moving and occupied and at to_floor, open doors + become unoccupied
        } else if (this.direction == 0 && this.occupied() && (to_floors.indexOf(this.current_floor) != -1 || from_floors.indexOf(this.current_floor) != -1)) {
            this.door_open = 1;
            this.log('open doors');

        // if not moving and target floor, start
        } else if (this.direction == 0 && this.requests.length) {
            var target_floor = this.occupied() ? this.requests[0].to_floor : this.requests[0].from_floor;
            if (target_floor > this.current_floor) {
                this.direction = 1;
                this.log('start moving up')
            } else {
                this.direction = -1;
                this.log('start moving down')
            }

        // if moving and reached target floor, stop
        } else if (this.direction != 0 && (from_floors.indexOf(this.current_floor) != -1 || to_floors.indexOf(this.current_floor) != -1)) {
            this.direction = 0;
            this.log('stop at ' + this.current_floor)

        // if moving and not reached target floor, move
        } else if (this.direction != 0) {
            this.current_floor += this.direction;
            this.log('moving ' + (this.direction > 0 ? 'up' : 'down'));

        } else {
            //this.log('do nothing');
        }

        if (this.door_open) {
            this.requests.forEach(request => {
                if (!request.picked_up && request.from_floor == this.current_floor) {
                    request.picked_up = 1;
                    this.log('picked up passengers at ' + this.current_floor);
                }
                if (request.picked_up && request.to_floor == this.current_floor) {
                    request.dropped_off = 1;
                    this.log('dropped off up passengers at ' + this.current_floor);
                }
            });

            this.requests = this.requests.filter(request => !request.dropped_off);
        }
    }

    log(msg) {
        console.log('elevator-' + this.id + ' at ' + this.current_floor + ': ' + msg);
    }
}

var controller = new ElevatorController(10, 2);
controller.request(2, 8);
controller.tick();
controller.request(6, 4);
controller.request(4, 6);
for (var i = 0; i < 20; ++i) {
    console.log('');
    controller.tick();
}
