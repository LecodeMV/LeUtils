import { Game_Battler } from 'mv-lib';

export type GameBattlerHandler = ReturnType<typeof handle>;

export default function handle(battler: Game_Battler) {
    return {
        isFriendWith(otherBattler: Game_Battler) {
            return (
                (battler.isActor() && otherBattler.isActor()) ||
                (!battler.isActor() && !otherBattler.isActor())
            );
        },
        isEnemyWith(otherBattler: Game_Battler) {
            return !this.isFriendWith(otherBattler);
        }
    };
}
