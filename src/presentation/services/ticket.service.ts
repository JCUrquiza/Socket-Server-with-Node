import { UuidAdapter } from '../../config/uuid.adapter';
import { Ticket } from '../../domain';
import { WssService } from './wss.service';

export class TicketService {

    constructor(
        private readonly wwsService = WssService.instance,
    ) {}

    public tickets: Ticket[] = [
        { id: UuidAdapter.v4(), number: 1, createdAt: new Date(), done: false },
        { id: UuidAdapter.v4(), number: 2, createdAt: new Date(), done: false },
        { id: UuidAdapter.v4(), number: 3, createdAt: new Date(), done: false },
        { id: UuidAdapter.v4(), number: 4, createdAt: new Date(), done: false },
        { id: UuidAdapter.v4(), number: 5, createdAt: new Date(), done: false },
        { id: UuidAdapter.v4(), number: 6, createdAt: new Date(), done: false },
    ];

    private readonly workingOnTickets: Ticket[] = [];

    
    public get pendingTickets(): Ticket[] {
        // return this.tickets.filter( ticket => ticket.done == false );
        return this.tickets.filter( ticket => !ticket.handleAtDesk );
    }
    
    public get lastWorkingOnTickets(): Ticket[] {
        return this.workingOnTickets.slice(0, 4);
    }

    public get lastTicketNumber(): number {
        // const ticketsSize = this.tickets.length;
        // return this.tickets.filter( ticket => ticket.number == ticketsSize);
        return this.tickets.length > 0 ? this.tickets.at(-1)!.number : 0;
    }

    public createTicket() {
        const ticket: Ticket = { id: UuidAdapter.v4(), number: this.lastTicketNumber + 1, createdAt: new Date(), done: false };
        this.tickets.push(ticket);
        // TODO: WS
        this.onTicketNumberChanged();
        return ticket;
    }

    public drawTicket(desk: string) {
        const ticket = this.tickets.find( t => !t.handleAtDesk );
        if ( !ticket ) return { status: 'No pending', message: 'No tickets pending' }

        ticket.handleAtDesk = desk;
        ticket.handleAt = new Date();

        // Agregar el ticket trabajando al arreglo para mostrarlo en pantalla:
        this.workingOnTickets.unshift({ ...ticket });

        // TODO WS
        this.onTicketNumberChanged();
        this.onWorkingOnChanged();

        return { status: 'ok', ticket };
    }

    public onFinishedTicket(id: string) {

        const ticket = this.tickets.find( ticket => ticket.id === id);
        if ( !ticket ) return { status: 'Error', message: 'Ticket not found' }

        this.tickets = this.tickets.map( ticket => {
            if ( ticket.id === id ) {
                ticket.done = true;
            }
            return ticket;
        });

        return { status: 'ok' }
    }

    private onTicketNumberChanged() {
        this.wwsService.sendMessage('on-ticket-count-changed', this.pendingTickets.length);
    }

    private onWorkingOnChanged() {
        this.wwsService.sendMessage('on-working-changed', this.lastWorkingOnTickets);
    }

}



