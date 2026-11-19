import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  it('should add and dismiss notifications', () => {
    const service = new NotificationService();
    expect(service.notifications().length).toBe(0);

    service.success('Guardado', 'Registro creado correctamente.');
    expect(service.notifications().length).toBe(1);
    expect(service.notifications()[0].type).toBe('success');

    const id = service.notifications()[0].id;
    service.dismiss(id);
    expect(service.notifications().length).toBe(0);
  });
});
