import { DeleteFaqAction } from './delete-faq-action';
import { OpenCreateFaqDrawerAction } from './open-create-faq-drawer-action';
import { OpenEditFaqDrawerAction } from './open-edit-faq-drawer-action';

export const FaqsActions = {
	OpenCreateFaqDrawer: OpenCreateFaqDrawerAction,
	OpenEditFaqDrawer: OpenEditFaqDrawerAction,
	DeleteFaq: DeleteFaqAction,
};
