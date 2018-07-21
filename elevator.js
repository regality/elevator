class ElevatorController {
    constructor(floors, elevator_count) {
        this.floors = floors;
        this.queue = [];
        this.elevators = [];
        for (var i = 0; i < elevator_count; ++i) {
            this.elevators.push(new Elevator());
        }
    }

    request(from_floor, to_floor) {
        this.queue.push({ from_floor: from_floor, to_floor: to_floor });
    }

    tick() {
        // first, decide on the action of each elevator
        // this is done by looping through the queue and looking at any requests that are not being serviced
        //      elevator actions include: start, move up, move down, stop, open doors, close doors, maintenance mode, maintaned
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
                        elevator.target_floors.length &&
                        (
                            (elevator.direction ==  1 && elevator.current_floor < request.from_floor && elevator.target_floors[0] >= request.from_floor) ||
                            (elevator.direction == -1 && elevator.current_floor > request.from_floor && elevator.target_floors[0] <= request.from_floor)
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
                best_elevator.target_floors = best_elevator.target_floors.concat([ request.from_floor, request.to_floor ]);
            }
        });

        this.elevators.forEach(function(elevator) {
            // have the elevator perform it's next action
            // move up, move down, stop, open doors, close doors
            //      assume one action can be performed for each tick
        });
    }
}

class Elevator {
    constructor(floors) {
        this.floors = floors;
        this.current_floor = 1;
        this.target_floors = [];
        this.door_open = 0;
        this.occupied = 0;
        this.direction = 0;
        this.trips = 0;
    }
}

