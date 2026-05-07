# Instructions

1. We are creating a new ERD (Engineering Requirement documents) from the current `/Users/molnarr2/Projects/homestead2/vault/homestead-vault/00_research/01_plan/00_gen/02. ERD/`
	1. The changes is that we have a scaffold app already setup for us. 
	2. The tech stack should be similar:
		1. The firebase and schema have changed. Instead we want services to call firestore directly.
		2. We want to use OnSnapshot for collections that make sense.
		3. Services should house the firebase and any other code from 3rd party libraries that makes sense.
		4. UI/Controllers should NOT access firebase.
		5. We still want to use Zustand
	3. The best way is to analyze the new scaffold of the app. And then process each file within the old ERD and make updates to them due to the new changes.
	4. Create the new ERD within the `/Users/molnarr2/Projects/homestead2/vault/homestead-vault/01_research/01_plan/00_gen/03. TDD/` folder.
