class ElevatorController {
    constructor(floors, elevator_count) {
        this.floors = floors;
        this.queue = [];
        this.elevators = [];
        for (var = 0; i < elevator_count; ++i) {
            this.elevators.push(new Elevator());
        }
    }

    request(from_floor, to_floor) {
        this.queue.push({ from: from_floor, to: to_floor });
    }

    tick() {
        // first, decide on the action of each elevator
        // this is done by looping through the queue and looking at any requests that are not being serviced
        //      elevator actions include: move up, move down, stop, open doors, close doors
        //      if an elevator is in progress, then don't stop it unless a request comes in that is on it's current path
        //
        this.queue.forEach((request) => {
            // find the elevator that is best to service the request
            // add the target floors to the elevator
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
    }
}
